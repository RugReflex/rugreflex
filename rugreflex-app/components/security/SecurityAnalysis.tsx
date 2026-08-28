interface SecurityAnalysisProps {
  mintAuthority: string | null;
  freezeAuthority: string | null;
}

function AuthorityCard({
  title,
  description,
  authority,
}: {
  title: string;
  description: string;
  authority: string | null;
}) {
  const revoked = !authority;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-widest ${
            revoked
              ? "bg-emerald-400/10 text-emerald-400"
              : "bg-red-400/10 text-red-400"
          }`}
        >
          {revoked ? "REVOKED" : "ACTIVE"}
        </span>
      </div>

      <div className="mt-5 border-t border-white/5 pt-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Authority address
        </div>

        <div className="mt-2 break-all font-mono text-xs text-slate-300">
          {authority || "None — authority revoked"}
        </div>
      </div>
    </div>
  );
}

export default function SecurityAnalysis({
  mintAuthority,
  freezeAuthority,
}: SecurityAnalysisProps) {
  return (
    <section>
      <div className="mb-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
          Token Security
        </div>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Authority Controls
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Mint and freeze authority controls detected during this scan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AuthorityCard
          title="Mint Authority"
          description="Controls whether additional tokens can be minted."
          authority={mintAuthority}
        />

        <AuthorityCard
          title="Freeze Authority"
          description="Controls whether token accounts can be frozen."
          authority={freezeAuthority}
        />
      </div>

      {!mintAuthority && !freezeAuthority && (
        <div className="mt-4 rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4 text-sm text-slate-300">
          No active mint or freeze authority was detected during this scan.
        </div>
      )}
    </section>
  );
}
