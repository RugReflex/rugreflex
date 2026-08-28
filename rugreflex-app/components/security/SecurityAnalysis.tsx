interface SecurityAnalysisProps {
  mintAuthority?: string | null;
  freezeAuthority?: string | null;
  mintRevoked?: boolean;
  freezeRevoked?: boolean;
}

function StatusBadge({
  safe,
  label,
}: {
  safe: boolean;
  label: string;
}) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider ${
        safe
          ? "border-white/[0.08] bg-white/[0.035] text-white/50"
          : "border-red-400/20 bg-red-400/[0.04] text-red-300/70"
      }`}
    >
      {label}
    </span>
  );
}

function shortenAddress(address?: string | null) {
  if (!address) return "Not detected";

  if (address.length <= 16) return address;

  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

export default function SecurityAnalysis({
  mintAuthority,
  freezeAuthority,
  mintRevoked,
  freezeRevoked,
}: SecurityAnalysisProps) {
  const mintIsRevoked =
    mintRevoked ?? !mintAuthority;

  const freezeIsRevoked =
    freezeRevoked ?? !freezeAuthority;

  const securityChecks = [
    {
      title: "Mint Authority",
      description:
        "Controls whether additional tokens can be minted.",
      safe: mintIsRevoked,
      authority: mintAuthority,
    },
    {
      title: "Freeze Authority",
      description:
        "Controls whether token accounts can be frozen.",
      safe: freezeIsRevoked,
      authority: freezeAuthority,
    },
  ];

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#1b050b]/75 p-6">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
          Security
        </p>

        <h2 className="mt-2 text-2xl font-black">
          Security Analysis
        </h2>

        <p className="mt-1 max-w-2xl text-xs leading-5 text-white/25">
          Observed token authority configuration from the
          available blockchain data.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {securityChecks.map((check) => (
          <div
            key={check.title}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold">
                  {check.title}
                </h3>

                <p className="mt-2 text-[11px] leading-5 text-white/25">
                  {check.description}
                </p>
              </div>

              <StatusBadge
                safe={check.safe}
                label={
                  check.safe
                    ? "Revoked"
                    : "Active"
                }
              />
            </div>

            <div className="mt-5 border-t border-white/[0.05] pt-4">
              <p className="text-[9px] uppercase tracking-wider text-white/20">
                Authority
              </p>

              <p
                className={`mt-2 font-mono text-[10px] ${
                  check.authority
                    ? "text-white/40"
                    : "text-white/20"
                }`}
              >
                {shortenAddress(check.authority)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] text-[10px] font-bold">
            i
          </div>

          <p className="text-[10px] leading-5 text-white/25">
            Revoked authorities reduce certain forms of
            administrative control, but they do not guarantee
            that a token is safe. RugReflex evaluates security
            alongside liquidity, holder concentration and
            other observable signals.
          </p>
        </div>
      </div>
    </section>
  );
}
