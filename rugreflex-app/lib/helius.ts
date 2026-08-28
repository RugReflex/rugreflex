export interface TokenHolder {
  address: string;
  amount: number;
  ownership: number;
}

export interface TokenSecurityData {
  mintAuthority: string | null;
  freezeAuthority: string | null;
}

export interface HeliusTokenData {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  price?: number;
  holders: TokenHolder[];
  totalHolders: number;
  security: TokenSecurityData;
}

function getApiKey(): string {
  const key = process.env.HELIUS_API_KEY;

  if (!key) {
    throw new Error(
      "HELIUS_API_KEY is missing"
    );
  }

  return key;
}

export async function getAsset(
  mint: string
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
        id: "rugreflex",
        method: "getAsset",

        params: {
          id: mint,

          displayOptions: {
            showFungible: true,
          },
        },
      }),

      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Helius request failed: ${response.status}`
    );
  }

  const json = await response.json();

  if (json.error) {
    throw new Error(
      json.error.message ||
        "Helius API error"
    );
  }

  return json.result;
}

export async function getTokenSupply(
  mint: string
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
        id: "rugreflex",
        method: "getTokenSupply",
        params: [mint],
      }),

      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Helius supply request failed: ${response.status}`
    );
  }

  const json = await response.json();

  if (json.error) {
    throw new Error(
      json.error.message ||
        "Unable to retrieve token supply"
    );
  }

  return json.result?.value;
}
