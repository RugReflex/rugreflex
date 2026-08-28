export interface DexPair {
  chainId?: string;
  dexId?: string;
  url?: string;
  pairAddress?: string;

  baseToken?: {
    address?: string;
    name?: string;
    symbol?: string;
  };

  quoteToken?: {
    address?: string;
    name?: string;
    symbol?: string;
  };

  priceUsd?: string;

  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };

  fdv?: number;
  marketCap?: number;

  volume?: {
    h24?: number;
  };
}

export interface DexScreenerResponse {
  schemaVersion?: string;
  pairs?: DexPair[];
}

export async function getDexScreenerData(mint: string) {
  const response = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${mint}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `DexScreener request failed: ${response.status}`
    );
  }

  const data: DexScreenerResponse = await response.json();

  const pairs = (data.pairs || [])
    .filter((pair) => pair.chainId === "solana")
    .sort(
      (a, b) =>
        (b.liquidity?.usd || 0) -
        (a.liquidity?.usd || 0)
    );

  const largestPair = pairs[0];

  return {
    pairs,

    largestPair,

    priceUsd: Number(
      largestPair?.priceUsd || 0
    ),

    liquidityUsd: Number(
      largestPair?.liquidity?.usd || 0
    ),

    volume24h: Number(
      largestPair?.volume?.h24 || 0
    ),

    marketCap: Number(
      largestPair?.marketCap ||
        largestPair?.fdv ||
        0
    ),

    fdv: Number(
      largestPair?.fdv || 0
    ),

    dex: largestPair?.dexId || "Unknown",

    pairAddress:
      largestPair?.pairAddress || "",

    pairUrl:
      largestPair?.url || "",
  };
}
