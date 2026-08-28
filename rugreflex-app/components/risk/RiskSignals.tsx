interface RiskSignal {
  title: string;
  description: string;
  status?: "positive" | "warning" | "danger";
}

interface RiskSignalsProps {
  signals: RiskSignal[];
}

export default function RiskSignals({ signals }: RiskSignalsProps) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
            Intelligence
          </div>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Detected Risk Signals
          </h2>
        </div>

        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
          {signals.length} signals
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {signals.map((signal, index) => {
          const status = signal.status || "positive";

          return (
            <div
              key={`${signal.title}-${index}`}
              className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
            >
              <div className="flex gap-4">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    status === "danger"
                      ? "bg-red-500/10 text-red-400"
                      : status === "warning"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {status === "danger" ? "!" : status === "warning" ? "!" : "✓"}
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-white">
                    {signal.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {signal.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
