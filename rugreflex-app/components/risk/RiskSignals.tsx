export interface RiskSignal {
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  points?: number;
}

interface RiskSignalsProps {
  signals: RiskSignal[];
}

const severityLabel = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

export default function RiskSignals({
  signals,
}: RiskSignalsProps) {
  if (!signals.length) {
    return (
      <section className="rounded-2xl border border-white/[0.07] bg-[#1b050b]/75 p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
          Risk Signals
        </p>

        <h3 className="mt-2 text-xl font-black">
          No signals available
        </h3>

        <p className="mt-2 text-xs leading-5 text-white/25">
          RugReflex could not identify additional risk signals
          from the available scan data.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#1b050b]/75 p-6">
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
          Risk Signals
        </p>

        <h3 className="mt-2 text-xl font-black">
          Detected Indicators
        </h3>
      </div>

      <div className="space-y-3">
        {signals.map((signal, index) => (
          <div
            key={`${signal.title}-${index}`}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {signal.title}
                  </span>

                  <span className="rounded-full border border-white/[0.07] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white/30">
                    {severityLabel[signal.severity]}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-white/25">
                  {signal.description}
                </p>
              </div>

              {signal.points !== undefined && (
                <span className="shrink-0 font-mono text-[10px] text-white/35">
                  +{signal.points} risk
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
