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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = mint.trim();

    if (!value || loading) return;

    onScan?.(value);
  }

  function handleClear() {
    setMint("");
  }

  return (
    <section className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">
            Solana Security Scanner
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Know the risk
            <br />
            <span className="text-white/45">before you buy.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/30">
            RugReflex analyzes Solana tokens and exposes potential
            warning signs including token security, holder concentration,
            liquidity and market activity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10">
          <div className="rounded-2xl border border-white/[0.09] bg-[#110308] p-2 shadow-2xl">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex min-w-0 flex-1 items-center">
                <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-xs font-black text-white/35 sm:flex">
                  $
                </div>

                <input
                  value={mint}
                  onChange={(event) => setMint(event.target.value)}
                  placeholder="Paste Solana token mint address"
                  disabled={loading}
                  spellCheck={false}
                  autoComplete="off"
                  className="h-12 w-full min-w-0 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/20 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                />

                {mint && !loading && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="mr-2 rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/25 transition hover:bg-white/[0.05] hover:text-white/60"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={!mint.trim() || loading}
                className="h-12 rounded-xl bg-white px-6 text-xs font-black tracking-[0.12em] text-[#64122b] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {loading ? "SCANNING..." : "SCAN TOKEN →"}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[9px] uppercase tracking-wider text-white/20">
          <span>Helius Powered</span>
          <span className="h-1 w-1 rounded-full bg-white/15" />
          <span>Solana</span>
          <span className="h-1 w-1 rounded-full bg-white/15" />
          <span>Market Data</span>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/20">
              01
            </p>
            <h3 className="mt-3 text-sm font-bold">
              Enter token
            </h3>
            <p className="mt-2 text-[11px] leading-5 text-white/25">
              Paste any Solana token mint address into the scanner.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/20">
              02
            </p>
            <h3 className="mt-3 text-sm font-bold">
              Analyze
            </h3>
            <p className="mt-2 text-[11px] leading-5 text-white/25">
              RugReflex retrieves observed blockchain and market signals.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/20">
              03
            </p>
            <h3 className="mt-3 text-sm font-bold">
              Assess risk
            </h3>
            <p className="mt-2 text-[11px] leading-5 text-white/25">
              Review the signals before making your own decision.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
