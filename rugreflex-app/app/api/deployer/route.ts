import { NextRequest, NextResponse } from "next/server";

function getApiKey(): string {
  const key = process.env.HELIUS_API_KEY;

  if (!key) {
    throw new Error("HELIUS_API_KEY is missing");
  }

  return key;
}

async function heliusRequest(
  method: string,
  params: unknown
) {
  const response = await fetch(
    `https://mainnet.helius-rpc.com/?api-key=${getApiKey()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "rugreflex-deployer",
        method,
        params,
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data?.error?.message ||
        `Helius request failed: ${response.status}`
    );
  }

  return data.result;
}

type RiskFlag = {
  type: "danger" | "warning" | "positive";
  title: string;
  description: string;
};

type DeployerSource =
  | "mint_authority"
  | "asset_authority"
  | "asset_owner"
  | "creation_transaction"
  | "unknown";

function isWalletAddress(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 32 &&
    value.length <= 44
  );
}

function extractFirstAccount(
  account: unknown
): string | null {
  if (typeof account === "string") {
    return isWalletAddress(account)
      ? account
      : null;
  }

  if (
    account &&
    typeof account === "object" &&
    "pubkey" in account
  ) {
    const pubkey = (account as { pubkey?: unknown }).pubkey;

    return isWalletAddress(pubkey)
      ? pubkey
      : null;
  }

  return null;
}

async function findCreationWallet(
  mint: string
): Promise<{
  address: string | null;
  signature: string | null;
}> {
  try {
    /*
     * The mint account is referenced by transactions that
     * created, initialized and later modified the token.
     *
     * We retrieve the oldest transaction available in the
     * returned history window and inspect its fee payer.
     */
    const signatures = await heliusRequest(
      "getSignaturesForAddress",
      [
        mint,
        {
          limit: 1000,
        },
      ]
    );

    if (!Array.isArray(signatures) || signatures.length === 0) {
      return {
        address: null,
        signature: null,
      };
    }

    const oldest = signatures[
      signatures.length - 1
    ];

    const signature =
      oldest?.signature;

    if (typeof signature !== "string") {
      return {
        address: null,
        signature: null,
      };
    }

    const transaction = await heliusRequest(
      "getTransaction",
      [
        signature,
        {
          encoding: "jsonParsed",
          maxSupportedTransactionVersion: 0,
        },
      ]
    );

    const accountKeys =
      transaction?.transaction?.message?.accountKeys;

    if (
      !Array.isArray(accountKeys) ||
      accountKeys.length === 0
    ) {
      return {
        address: null,
        signature,
      };
    }

    /*
     * The first account in a Solana transaction message is
     * normally the fee payer. For token creation this is a
     * useful creator/deployer signal.
     */
    const feePayer = extractFirstAccount(
      accountKeys[0]
    );

    return {
      address: feePayer,
      signature,
    };
  } catch (error) {
    console.error(
      "Unable to identify creation wallet:",
      error
    );

    return {
      address: null,
      signature: null,
    };
  }
}

export async function GET(
  request: NextRequest
) {
  try {
    const mint =
      request.nextUrl.searchParams
        .get("mint")
        ?.trim();

    if (!mint) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Token mint address is required",
        },
        { status: 400 }
      );
    }

    /*
     * =====================================================
     * STEP 1 — GET TOKEN ASSET
     * =====================================================
     */

    const asset = await heliusRequest(
      "getAsset",
      {
        id: mint,
        displayOptions: {
          showFungible: true,
        },
      }
    );

    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Token asset not found",
        },
        { status: 404 }
      );
    }

    /*
     * =====================================================
     * STEP 2 — IDENTIFY DEPLOYER / AUTHORITY
     * =====================================================
     */

    let deployer: string | null = null;

    let source: DeployerSource =
      "unknown";

    /*
     * Helius fungible-token information can expose the
     * current mint authority here.
     */
    const mintAuthority =
      asset?.token_info?.mint_authority;

    if (isWalletAddress(mintAuthority)) {
      deployer = mintAuthority;
      source = "mint_authority";
    }

    /*
     * Secondary DAS authority signal.
     */
    if (!deployer) {
      const authorities =
        Array.isArray(asset?.authorities)
          ? asset.authorities
          : [];

      for (const authority of authorities) {
        const address =
          authority?.address;

        if (isWalletAddress(address)) {
          deployer = address;
          source = "asset_authority";
          break;
        }
      }
    }

    /*
     * Secondary ownership signal.
     */
    if (!deployer) {
      const owner =
        asset?.ownership?.owner;

      if (isWalletAddress(owner)) {
        deployer = owner;
        source = "asset_owner";
      }
    }

    /*
     * =====================================================
     * STEP 3 — HISTORICAL CREATION WALLET
     * =====================================================
     *
     * If there is no current authority/owner wallet,
     * inspect the earliest available transaction involving
     * the mint and use its fee payer as a creator signal.
     */

    let creationSignature: string | null =
      null;

    if (!deployer) {
      const creation =
        await findCreationWallet(mint);

      if (creation.address) {
        deployer =
          creation.address;

        source =
          "creation_transaction";

        creationSignature =
          creation.signature;
      }
    }

    /*
     * =====================================================
     * STEP 4 — WALLET INTELLIGENCE
     * =====================================================
     */

    let solBalance = 0;
    let recentTransactionCount = 0;

    if (deployer) {
      try {
        const balanceResult =
          await heliusRequest(
            "getBalance",
            [deployer]
          );

        solBalance =
          Number(
            balanceResult?.value || 0
          ) / 1_000_000_000;
      } catch (error) {
        console.error(
          "Unable to retrieve deployer balance:",
          error
        );
      }

      try {
        const signatures =
          await heliusRequest(
            "getSignaturesForAddress",
            [
              deployer,
              {
                limit: 50,
              },
            ]
          );

        if (Array.isArray(signatures)) {
          recentTransactionCount =
            signatures.length;
        }
      } catch (error) {
        console.error(
          "Unable to retrieve deployer transactions:",
          error
        );
      }
    }

    /*
     * =====================================================
     * STEP 5 — RISK FLAGS
     * =====================================================
     */

    const flags: RiskFlag[] = [];

    if (!deployer) {
      flags.push({
        type: "warning",
        title:
          "DEPLOYER NOT IDENTIFIED",
        description:
          "RugReflex could not confidently identify a wallet associated with the token's current authority, ownership data, or available creation history.",
      });
    } else {
      let sourceLabel =
        "authority-associated wallet";

      if (
        source ===
        "creation_transaction"
      ) {
        sourceLabel =
          "token creation transaction";
      } else if (
        source ===
        "mint_authority"
      ) {
        sourceLabel =
          "current mint authority";
      } else if (
        source ===
        "asset_authority"
      ) {
        sourceLabel =
          "token authority data";
      } else if (
        source ===
        "asset_owner"
      ) {
        sourceLabel =
          "token ownership data";
      }

      flags.push({
        type: "positive",
        title:
          "DEPLOYER WALLET IDENTIFIED",
        description:
          `RugReflex identified ${deployer.slice(
            0,
            8
          )}...${deployer.slice(
            -8
          )} using ${sourceLabel}.`,
      });

      /*
       * Activity assessment.
       */

      if (
        recentTransactionCount >= 40
      ) {
        flags.push({
          type: "warning",
          title:
            "ACTIVE DEPLOYER WALLET",
          description:
            "The identified wallet shows substantial recent blockchain activity in the retrieved transaction window.",
        });
      } else if (
        recentTransactionCount > 0
      ) {
        flags.push({
          type: "positive",
          title:
            "DEPLOYER ACTIVITY DETECTED",
          description:
            "Recent blockchain activity was detected for the identified wallet.",
        });
      } else {
        flags.push({
          type: "warning",
          title:
            "LIMITED DEPLOYER ACTIVITY",
          description:
            "No recent transaction activity was found in the retrieved activity window.",
        });
      }

      /*
       * SOL balance assessment.
       */

      if (solBalance < 0.01) {
        flags.push({
          type: "warning",
          title:
            "VERY LOW SOL BALANCE",
          description:
            "The identified wallet currently holds less than 0.01 SOL.",
        });
      } else if (
        solBalance >= 0.1
      ) {
        flags.push({
          type: "positive",
          title:
            "SOL BALANCE DETECTED",
          description:
            `The identified wallet currently holds approximately ${solBalance.toFixed(
              3
            )} SOL.`,
        });
      }
    }

    /*
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    return NextResponse.json({
      success: true,

      deployer: {
        address: deployer,
        solBalance,
        recentTransactionCount,
        source,
        creationSignature,
        flags,
      },

      timestamp:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "RugReflex deployer intelligence error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to analyze deployer",
      },
      { status: 500 }
    );
  }
}
