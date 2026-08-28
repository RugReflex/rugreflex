interface RiskScoreProps {
  score: number;
}

function getRisk(score: number) {
  if (score <= 20) {
    return {
      label: "LOW OBSERVED RISK",
      range: "0–20",
    };
  }

  if (score <= 40) {
    return {
      label: "MODERATE",
      range: "21–40",
    };
  }

  if (score <= 60) {
    return {
      label: "ELEVATED",
      range: "41–60",
    };
  }

  if (score <= 80) {
    return {
      label: "HIGH",
      range: "61–80",
    };
  }

  return {
    label: "EXTREME",
    range: "81–100",
  };
}

export default function RiskScore({ score }: RiskScoreProps) {
  const safeScore = Math.min(100, Math.max(0, score));
  const risk = getRisk(safeScore);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl">
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
          RugReflex Intelligence
        </div>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Observed Risk Score
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Based on observable signals available during this scan.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[180px_1fr] md:items-center">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-6xl font-black tracking-tight text-white">
            {safeScore}
            <span className="text-2xl text-slate-500">/100</span>
          </div>

          <div className="mt-3 text-center text-xs font-bold uppercase tracking-widest text-emerald-400">
            {risk.label}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
            <span>Lower risk</span>
            <span>Higher risk</span>
          </div>

          <div className="relative h-4 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500"
              style={{ width: `${Math.max(safeScore, 2)}%` }}
            />
          </div>

          <div className="mt-3 flex justify-between text-[10px] text-slate-500">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[
              ["0–20", "LOW"],
              ["21–40", "MODERATE"],
              ["41–60", "ELEVATED"],
              ["61–80", "HIGH"],
              ["81–100", "EXTREME"],
            ].map(([range, label]) => (
              <div
                key={range}
                className={`rounded-xl border p-3 text-center ${
                  range === risk.range
                    ? "border-cyan-400/40 bg-cyan-400/10"
                    : "border-white/5 bg-white/[0.02]"
                }`}
              >
                <div className="text-[10px] text-slate-500">{range}</div>
                <div className="mt-1 text-[10px] font-bold text-slate-300">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm leading-6 text-slate-400">
        The checks performed by RugReflex found observable blockchain signals
        associated with this token. This does not mean the token is safe or
        guaranteed to perform in any particular way.
      </div>
    </section>
  );
}
