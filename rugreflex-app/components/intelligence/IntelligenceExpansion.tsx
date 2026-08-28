const features = [
  {
    icon: "D",
    title: "Deployer Intelligence",
    description:
      "Analyze deployer wallets, funding paths, wallet history and related token activity.",
  },
  {
    icon: "AI",
    title: "AI Risk Intelligence",
    description:
      "Turn raw blockchain signals into clear, explainable risk intelligence.",
  },
  {
    icon: "W",
    title: "Wallet Intelligence",
    description:
      "Monitor suspicious wallets and discover relationships across token ecosystems.",
  },
];

export default function IntelligenceExpansion() {
  return (
    <section>
      <div className="mb-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
          Coming to RugReflex
        </div>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Intelligence Expansion
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          RugReflex is being built into a broader token and wallet intelligence
          platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border border-white/10 bg-slate-950/60 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-xs font-black text-cyan-300">
                {feature.icon}
              </div>

              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                Planned
              </span>
            </div>

            <h3 className="mt-5 font-bold text-white">{feature.title}</h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            RugReflex Growth
          </div>

          <h3 className="mt-3 text-xl font-bold text-white">
            Referral System
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            A future referral system will allow users to invite others and earn
            rewards within the RugReflex ecosystem.
          </p>

          <div className="mt-5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Coming Soon
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
          <div className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Premium Intelligence
          </div>

          <h3 className="mt-3 text-xl font-bold text-white">
            RugReflex Pro
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Future premium plans can unlock advanced scans, deeper wallet
            intelligence, monitoring, reports and professional tools.
          </p>

          <div className="mt-5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Coming Soon
          </div>
        </div>
      </div>
    </section>
  );
}
