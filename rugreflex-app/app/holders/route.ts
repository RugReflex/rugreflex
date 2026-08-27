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
          id: "rugreflex",
          method: "getTokenAccounts",
          params: {
            mint: address,
            page: 1,
            limit: 10,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return Response.json(
        {
          success: false,
          error: data.error.message,
        },
        { status: 400 }
      );
    }

    const accounts = data.result?.token_accounts || [];

    const holderMap: Record<string, number> = {};

    for (const account of accounts) {
      const owner = account.owner;
      const amount = Number(account.amount || 0);

      holderMap[owner] = (holderMap[owner] || 0) + amount;
    }

    const holders = Object.entries(holderMap)
      .map(([owner, amount]) => ({
        owner,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

    return Response.json({
      success: true,
      totalAccounts: accounts.length,
      totalHolders: holders.length,
      holders: holders.slice(0, 10),
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: "Failed to fetch holder data",
      },
      { status: 500 }
    );
  }
}