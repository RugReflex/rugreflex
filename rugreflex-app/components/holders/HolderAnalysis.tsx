interface Holder {
  address: string;
  amount: number;
  ownership: number;
}

interface HolderAnalysisProps {
  accountsScanned: number;
  holdersFound: number;
  holders: Holder[];
}

function shortAddress(address: string) {
  if (!address) return "Unknown";
  if (address.length <= 18) return address;
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

function number(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function HolderAnalysis({
  accountsScanned,
  holdersFound,
  holders,
}: HolderAnalysisProps) {
  const sorted = [...holders]
    .sort((a, b) => b.ownership - a.ownership)
    .slice(0, 20);

  const topHolder = sorted[0]?.ownership || 0;
  const top5 = sorted.slice(0, 5).reduce((sum, h) => sum + h.ownership, 0);
  const top10 = sorted.slice(0, 10).reduce((sum, h) => sum + h.ownership, 0);
  const top20 = sorted.slice(0, 20).reduce((sum, h) => sum + h.ownership, 0);

  return (
    <section>
      <div className="mb-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
          Distribution
        </div>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Holder Analysis
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Wallet concentration snapshot.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Accounts Scanned", number(accountsScanned)],
          ["Holders Found", number(holdersFound)],
          ["Top Holder", `${topHolder.toFixed(6)}%`],
          ["Top 10 Holders", `${top10.toFixed(6)}%`],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-slate-950/60 p-5"
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {label}
            </div>
            <div className="mt-2 text-2xl font-black text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          ["Top 5", top5],
          ["Top 10", top10],
          ["Top 20", top20],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
          >
            <div className="text-xs text-slate-500">{label}</div>
            <div className="mt-1 font-bold text-white">
              {Number(value).toFixed(6)}%
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="font-bold text-white">Top Holders</h3>
          <p className="mt-1 text-xs text-slate-500">
            Largest wallets detected during this scan.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-white/5 text-[10px] uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-5 py-4">Rank</th>
                <th className="px-5 py-4">Wallet</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Ownership</th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((holder, index) => (
                <tr
                  key={holder.address}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-5 py-4 font-bold text-white">
                    {index + 1}
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-slate-300">
                    {shortAddress(holder.address)}
                  </td>

                  <td className="px-5 py-4 text-slate-300">
                    {number(holder.amount)}
                  </td>

                  <td className="px-5 py-4 font-bold text-white">
                    {holder.ownership.toFixed(6)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
