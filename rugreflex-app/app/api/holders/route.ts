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
  const address = searchParams.get("address")?.trim();

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
    const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

    // =====================================================
    // 1. GET TOKEN INFORMATION
    // =====================================================

    const tokenResponse = await fetch(rpcUrl, {
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
      cache: "no-store",
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      return Response.json(
        {
          success: false,
          error:
            tokenData.error?.message ||
            "Failed to fetch token information from Helius",
        },
        { status: 400 }
      );
    }

    const tokenInfo = tokenData.result?.token_info || {};

    const decimals = Number(tokenInfo.decimals ?? 0);

    /*
     * Helius returns supply in raw token units.
     *
     * Example:
     * raw supply = 8,000,000,000,000,000
     * decimals   = 6
     *
     * human supply = 8,000,000,000
     */

    const rawSupply = Number(tokenInfo.supply ?? 0);

    const totalSupply =
      decimals > 0
        ? rawSupply / Math.pow(10, decimals)
        : rawSupply;

    // =====================================================
    // 2. GET TOKEN ACCOUNTS / HOLDERS
    // =====================================================

    const allAccounts: any[] = [];

    let page = 1;

    /*
     * MVP limit.
     *
     * Helius returns up to 1,000 accounts per page.
     * Ten pages gives us up to 10,000 token accounts.
     */
    const maxPages = 10;

    while (page <= maxPages) {
      const holdersResponse = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: `rugreflex-holders-${page}`,
          method: "getTokenAccounts",
          params: {
            mint: address,
            page,
            limit: 1000,
          },
        }),
        cache: "no-store",
      });

      const holdersData = await holdersResponse.json();

      if (!holdersResponse.ok || holdersData.error) {
        return Response.json(
          {
            success: false,
            error:
              holdersData.error?.message ||
              "Failed to fetch holder data from Helius",
          },
          { status: 400 }
        );
      }

      const accounts =
        holdersData.result?.token_accounts || [];

      if (accounts.length === 0) {
        break;
      }

      allAccounts.push(...accounts);

      /*
       * Fewer than 1,000 means this is the final page.
       */
      if (accounts.length < 1000) {
        break;
      }

      page++;
    }

    // =====================================================
    // 3. NO HOLDERS FOUND
    // =====================================================

    if (allAccounts.length === 0) {
      return Response.json({
        success: true,

        totalAccounts: 0,
        totalHolders: 0,

        totalSupply,
        decimals,

        topHolderPercentage: 0,
        top5Percentage: 0,
        top10Percentage: 0,
        top20Percentage: 0,
        top50Percentage: 0,

        concentrationRisk: "UNKNOWN",

        holders: [],
      });
    }

    // =====================================================
    // 4. COMBINE TOKEN ACCOUNTS BY OWNER
    // =====================================================

    const holderMap: Record<string, number> = {};

    for (const account of allAccounts) {
      const owner = account.owner;

      if (!owner) {
        continue;
      }

      const rawAmount = Number(account.amount ?? 0);

      const amount =
        decimals > 0
          ? rawAmount / Math.pow(10, decimals)
          : rawAmount;

      /*
       * A wallet can have multiple token accounts.
       *
       * We combine all token accounts belonging
       * to the same owner.
       */
      holderMap[owner] =
        (holderMap[owner] || 0) + amount;
    }

    // =====================================================
    // 5. REMOVE ZERO-BALANCE HOLDERS
    // =====================================================

    const holders = Object.entries(holderMap)
      .filter(([, amount]) => amount > 0)
      .map(([owner, amount]) => ({
        owner,
        amount,

        percentage:
          totalSupply > 0
            ? Number(
                ((amount / totalSupply) * 100).toFixed(6)
              )
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // =====================================================
    // 6. CONCENTRATION CALCULATOR
    // =====================================================

    const calculateConcentration = (count: number) => {
      if (totalSupply <= 0) {
        return 0;
      }

      const amount = holders
        .slice(0, count)
        .reduce(
          (sum, holder) => sum + holder.amount,
          0
        );

      return Number(
        ((amount / totalSupply) * 100).toFixed(6)
      );
    };

    // =====================================================
    // 7. CONCENTRATION LEVELS
    // =====================================================

    const topHolderPercentage =
      holders.length > 0
        ? holders[0].percentage
        : 0;

    const top5Percentage =
      calculateConcentration(5);

    const top10Percentage =
      calculateConcentration(10);

    const top20Percentage =
      calculateConcentration(20);

    const top50Percentage =
      calculateConcentration(50);

    // =====================================================
    // 8. CONCENTRATION RISK
    // =====================================================

    let concentrationRisk = "LOW";

    if (
      totalSupply <= 0 ||
      holders.length === 0
    ) {
      concentrationRisk = "UNKNOWN";
    } else if (topHolderPercentage >= 50) {
      concentrationRisk = "VERY HIGH";
    } else if (topHolderPercentage >= 25) {
      concentrationRisk = "HIGH";
    } else if (topHolderPercentage >= 10) {
      concentrationRisk = "MEDIUM";
    } else if (top10Percentage >= 50) {
      concentrationRisk = "HIGH";
    } else if (top10Percentage >= 30) {
      concentrationRisk = "MEDIUM";
    }

    // =====================================================
    // 9. RETURN RESULT
    // =====================================================

    return Response.json({
      success: true,

      /*
       * Number of token accounts actually scanned.
       */
      totalAccounts: allAccounts.length,

      /*
       * Number of unique wallet owners.
       */
      totalHolders: holders.length,

      totalSupply,

      decimals,

      topHolderPercentage,

      top5Percentage,

      top10Percentage,

      top20Percentage,

      top50Percentage,

      concentrationRisk,

      /*
       * Return all detected holders.
       *
       * The frontend currently displays the top 20.
       */
      holders,
    });
  } catch (error) {
    console.error(
      "RUGREFLEX HOLDER API ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Failed to fetch holder data",
      },
      { status: 500 }
    );
  }
}