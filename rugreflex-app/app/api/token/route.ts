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
    const response = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "rugreflex-token",
          method: "getAsset",
          params: {
            id: address,
            displayOptions: {
              showFungible: true,
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          error: "Helius request failed",
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
            "Helius returned an error",
        },
        { status: 400 }
      );
    }

    if (!data.result) {
      return Response.json(
        {
          success: false,
          error:
            "Token not found or Helius returned no token data.",
        },
        { status: 404 }
      );
    }

    const asset = data.result;

    // ==========================================
    // TOKEN SECURITY AUTHORITIES
    // ==========================================

    const authorities = asset.authorities || [];

    let mintAuthority: string | null = null;
    let freezeAuthority: string | null = null;

    for (const authority of authorities) {
      const type = authority.type;

      if (type === "mint") {
        mintAuthority =
          authority.address || null;
      }

      if (type === "freeze") {
        freezeAuthority =
          authority.address || null;
      }
    }

    // Some Helius responses may expose the
    // authority information through ownership.
    // Keep the original asset data intact while
    // adding a normalized security section.

    const security = {
      mintAuthority,
      freezeAuthority,

      mintAuthorityActive:
        mintAuthority !== null,

      freezeAuthorityActive:
        freezeAuthority !== null,
    };

    return Response.json({
      success: true,

      data: {
        ...asset,

        security,
      },
    });
  } catch (error) {
    console.error("TOKEN API ERROR:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to connect to Helius",
      },
      { status: 500 }
    );
  }
}