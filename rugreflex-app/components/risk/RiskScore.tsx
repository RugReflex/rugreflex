"use client";

interface RiskScoreProps {
  score: number;
  label?: string;
  summary?: string;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function getRisk(score: number) {
  if (score >= 80) {
    return {
      label: "CRITICAL RISK",
      description: "Multiple severe risk indicators detected.",
    };
  }

  if (score >= 60) {
    return {
      label: "HIGH RISK",
      description: "Several significant risk indicators detected.",
    };
  }

  if (score >= 35) {
    return {
      label: "MODERATE RISK",
      description: "Some risk indicators require attention.",
    };
  }

  return {
    label: "LOWER RISK",
    description: "Fewer major risk indicators were observed.",
  };
}

export default function RiskScore({
  score,
  label,
  summary,
}: RiskScoreProps) {
  const normalizedScore = clamp(Number(score) || 0);
  const risk = getRisk(normalizedScore);

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#1b050b]/75 p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
            RugReflex Risk Assessment
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight">
            {label || risk.label}
          </h2>

          <p className="mt-2 max-w-xl text-xs leading-5 text-white/30">
            {summary || risk.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-white/20">
              Risk Score
            </p>

            <p className="mt-1 text-4xl font-black">
              {Math.round(normalizedScore)}
              <span className="text-sm font-medium text-white/20">
                /100
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-2 flex items-center justify-between text-[9px] uppercase tracking-wider text-white/20">
          <span>Lower Risk</span>
          <span>Higher Risk</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{
              width: `${normalizedScore}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.018] p-3">
          <p className="text-[8px] uppercase tracking-wider text-white/20">
            0–34
          </p>
          <p className="mt-1 text-[10px] font-bold text-white/45">
            Lower
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.018] p-3">
          <p className="text-[8px] uppercase tracking-wider text-white/20">
            35–59
          </p>
          <p className="mt-1 text-[10px] font-bold text-white/45">
            Moderate
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.018] p-3">
          <p className="text-[8px] uppercase tracking-wider text-white/20">
            60–79
          </p>
          <p className="mt-1 text-[10px] font-bold text-white/45">
            High
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.018] p-3">
          <p className="text-[8px] uppercase tracking-wider text-white/20">
            80–100
          </p>
          <p className="mt-1 text-[10px] font-bold text-white/45">
            Critical
          </p>
        </div>
      </div>
    </section>
  );
}
