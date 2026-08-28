interface LiquidityAnalysisProps {
  liquidityUsd: number;
  volume24h: number;
  dex: string;
  pairs: number;
  pairAddress?: string;
  pairUrl?: string;
  priceUsd?: number;
  marketCap?: number;
  fdv?: number;
}

function money(value?: number) {
  if (!Number.isFinite(value)) return "$0";

  if ((value || 0) >= 1_000_000_000) {
    return `$${((value || 0) / 1_000_000_000).toFixed(2)}B`;
  }

  if ((value || 0) >= 1_000_000) {
    return `$${((value || 0) / 1_000_000).toFixed(2)}M`;
  }

  if ((value || 0) >= 1_000) {
    return `$${((value || 0) / 1_000).toFixed(2)}K`;
  }

  return `$${(value || 0).toFixed(2)}`;
}

export default function LiquidityAnalysis({
  liquidityUsd,
  volume24h,
  dex,
  pairs,
  pairAddress,
  pairUrl,
  priceUsd,
  marketCap,
  fdv,
}: LiquidityAnalysisProps) {
  const stronger = liquidityUsd >= 100_000;

  return (
    <section>
      <div className="mb-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
          Market Intelligence
        </div>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Liquidity Analysis
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Largest detected Solana trading pool.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Liquidity Found
            </div>

            <div
              className={`mt-3 text-xl font-black ${
                stronger ? "text-emerald-400" : "text-yellow-400"
              }`}
            >
              {stronger ? "STRONGER LIQUIDITY" : "LIMITED LIQUIDITY"}
            </div>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              {stronger
                ? "The largest detected Solana pool has at least $100,000 in liquidity."
                : "The detected pool has less than $100,000 in liquidity."}{" "}
              Liquidity is only one token-risk signal.
            </p>
          </div>

          {pairUrl && (
            <a
              href={pairUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-center text-xs font-bold text-cyan-300 transition hover:bg-cyan-400/20"
            >
              View Trading Pair →
            </a>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Liquidity", money(liquidityUsd)],
            ["24h Volume", money(volume24h)],
            ["DEX", dex || "Unknown"],
            ["Pairs", String(pairs || 0)],
            ["Pool Price", money(priceUsd)],
            ["Market Cap", money(marketCap)],
            ["FDV", money(fdv)],
            ["Pair", pairAddress || "Unavailable"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {label}
              </div>
              <div className="mt-2 truncate text-sm font-bold text-white">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
