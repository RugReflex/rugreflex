"use client";

import { FormEvent, useState } from "react";

interface ScannerProps {
  onScan?: (mint: string) => void;
  loading?: boolean;
}

export default function Scanner({
  onScan,
  loading = false,
}: ScannerProps) {
  const [mint, setMint] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = mint.trim();

    if (!value) return;

    onScan?.(value);
  }

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
        Scan a Solana token
      </div>

      <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
        Know the risk
        <span className="text-cyan-400"> before you buy.</span>
      </h1>

      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
        RugReflex analyzes observable Solana blockchain and market signals to
        help you understand token risk before making a decision.
      </p>

      <form onSubmit={submit} className="mt-8">
        <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/80 p-3 shadow-2xl sm:flex-row">
          <input
            value={mint}
            onChange={(event) => setMint(event.target.value)}
            placeholder="Enter a token mint address"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4 font-mono text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
          />

          <button
            type="submit"
            disabled={loading || !mint.trim()}
            className="rounded-2xl bg-cyan-400 px-7 py-4 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "SCANNING..." : "SCAN TOKEN →"}
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between px-2 text-[10px] uppercase tracking-widest text-slate-600">
          <span>Helius Powered</span>
          <span>Press Enter to scan</span>
        </div>
      </form>
    </section>
  );
}
