import { NextRequest, NextResponse } from "next/server";
import { getAsset, getTokenSupply } from "@/lib/helius";
import { getDexScreenerData } from "@/lib/dexscreener";

export async function GET(request: NextRequest) {
  try {
    const mint = request.nextUrl.searchParams.get("mint");

    if (!mint) {
      return NextResponse.json(
        {
          error: "Token mint address is required",
        },
        { status: 400 }
      );
    }

    const [asset, supply, market] = await Promise.all([
      getAsset(mint),
      getTokenSupply(mint),
      getDexScreenerData(mint),
    ]);

    const content = asset?.content || {};
    const metadata = content?.metadata || {};

    const tokenName =
      metadata?.name ||
      asset?.token_info?.symbol ||
      "Unknown Token";

    const symbol =
      metadata?.symbol ||
      asset?.token_info?.symbol ||
      "";

    const decimals =
      supply?.decimals ??
      asset?.token_info?.decimals ??
      0;

    const rawSupply =
      Number(supply?.amount || 0);

    const totalSupply =
      decimals > 0
        ? rawSupply / 10 ** decimals
        : rawSupply;

    const mintAuthority =
      asset?.authorities?.find(
        (authority: any) =>
          authority?.scopes?.includes("mint")
      )?.address || null;

    const freezeAuthority =
      asset?.authorities?.find(
        (authority: any) =>
          authority?.scopes?.includes("freeze")
      )?.address || null;

    return NextResponse.json({
      success: true,

      token: {
        mint,
        name: tokenName,
        symbol,
        decimals,
        supply: totalSupply,

        price: market.priceUsd,

        marketCap: market.marketCap,

        fdv: market.fdv,
      },

      market: {
        priceUsd: market.priceUsd,
        marketCap: market.marketCap,
        fdv: market.fdv,
        liquidityUsd: market.liquidityUsd,
        volume24h: market.volume24h,
        dex: market.dex,
        pairAddress: market.pairAddress,
        pairUrl: market.pairUrl,
        pairs: market.pairs.length,
      },

      security: {
        mintAuthority,
        freezeAuthority,
        mintRevoked: !mintAuthority,
        freezeRevoked: !freezeAuthority,
      },

      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("RugReflex scan error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to scan token",
      },
      { status: 500 }
    );
  }
}
