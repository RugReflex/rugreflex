export async function GET(request: Request) {
  const apiKey = process.env.HELIUS_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        success: false,
        error: "HELIUS_API_KEY is missing",
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return Response.json(
      {
        success: false,
        error: "Token address is required",
      },
      { status: 400 }
    );
  }

  try {
    // ==========================================
    // GET TOKEN MINT ACCOUNT FROM SOLANA RPC
    // ==========================================

    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "rugreflex-security",
          method: "getAccountInfo",
          params: [
            address,
            {
              encoding: "jsonParsed",
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          error: "Solana RPC request failed",
          details: data,
        },
        { status: 500 }
      );
    }

    if (data.error) {
      return Response.json(
        {
          success: false,
          error:
            data.error.message ||
            "Solana RPC returned an error",
        },
        { status: 400 }
      );
    }

    if (!data.result) {
      return Response.json(
        {
          success: false,
          error:
            "Token mint account not found.",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // PARSE TOKEN MINT DATA
    // ==========================================

    const parsed =
      data.result?.value?.data?.parsed;

    const info = parsed?.info;

    if (!info) {
      return Response.json(
        {
          success: false,
          error:
            "Unable to read token mint information.",
        },
        { status: 400 }
      );
    }

    const mintAuthority =
      info.mintAuthority || null;

    const freezeAuthority =
      info.freezeAuthority || null;

    // ==========================================
    // SECURITY STATUS
    // ==========================================

    const mintAuthorityActive =
      mintAuthority !== null;

    const freezeAuthorityActive =
      freezeAuthority !== null;

    return Response.json({
      success: true,

      address,

      security: {
        mintAuthority,
        freezeAuthority,

        mintAuthorityActive,
        freezeAuthorityActive,
      },
    });
  } catch (error) {
    console.error(
      "SECURITY API ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Failed to retrieve token security information.",
      },
      { status: 500 }
    );
  }
}
