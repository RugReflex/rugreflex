"use client";

import { useState } from "react";

type TokenData = {
  id?: string;

  content?: {
    metadata?: {
      name?: string;
      symbol?: string;
      description?: string;
      image?: string;
    };
  };

  token_info?: {
    symbol?: string;
    supply?: number;
    decimals?: number;

    price_info?: {
      price_per_token?: number;
      currency?: string;
    };
  };
};

type Holder = {
  owner: string;
  amount: number;
  percentage: number | null;
};

type HolderData = {
  success: boolean;
  totalAccounts: number;
  totalHolders: number;
  totalSupply: number;
  topHolderPercentage: number;
  top10Percentage: number;
  concentrationRisk: string;
  holders: Holder[];
};

type RiskLevel = {
  score: number;
  label: string;
  description: string;
};

export default function Home() {
  const [address, setAddress] = useState("");
  const [token, setToken] = useState<TokenData | null>(null);
  const [holderData, setHolderData] =
    useState<HolderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function scanToken() {
    const tokenAddress = address.trim();

    if (!tokenAddress) {
      setError("Please enter a Solana token address.");
      return;
    }

    if (
      tokenAddress.length < 32 ||
      tokenAddress.length > 44
    ) {
      setError("Invalid Solana token address.");
      return;
    }

    setLoading(true);
    setError("");
    setToken(null);
    setHolderData(null);

    try {
      // ==========================================
      // 1. TOKEN INFORMATION
      // ==========================================

      const tokenResponse = await fetch(
        `/api/token?address=${encodeURIComponent(
          tokenAddress
        )}`
      );

      const tokenResult = await tokenResponse.json();

      console.log("TOKEN API RESULT:", tokenResult);

      if (!tokenResponse.ok || !tokenResult.success) {
        throw new Error(
          tokenResult.error ||
            "Unable to fetch token information."
        );
      }

      setToken(tokenResult.data);

      // ==========================================
      // 2. HOLDER INFORMATION
      // ==========================================

      const holdersResponse = await fetch(
        `/api/holders?address=${encodeURIComponent(
          tokenAddress
        )}`
      );

      const holdersResult = await holdersResponse.json();

      console.log(
        "HOLDERS API RESULT:",
        holdersResult
      );

      if (
        holdersResponse.ok &&
        holdersResult.success
      ) {
        setHolderData(holdersResult);
      }
    } catch (err) {
      console.error("SCAN ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while scanning."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearScan() {
    setAddress("");
    setToken(null);
    setHolderData(null);
    setError("");
    setCopied(false);
  }

  async function copyAddress() {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  // ==========================================
  // RISK SCORE ENGINE
  // ==========================================

  function calculateRiskScore(): RiskLevel {
    if (!holderData) {
      return {
        score: 0,
        label: "NOT ANALYZED",
        description:
          "Risk analysis will appear after holder data is retrieved.",
      };
    }

    let score = 0;

    const topHolder =
      holderData.topHolderPercentage || 0;

    const top10 =
      holderData.top10Percentage || 0;

    // ========================================
    // TOP HOLDER CONCENTRATION
    // ========================================

    if (topHolder >= 50) {
      score += 40;
    } else if (topHolder >= 35) {
      score += 32;
    } else if (topHolder >= 25) {
      score += 24;
    } else if (topHolder >= 15) {
      score += 15;
    } else if (topHolder >= 10) {
      score += 8;
    }

    // ========================================
    // TOP 10 CONCENTRATION
    // ========================================

    if (top10 >= 90) {
      score += 40;
    } else if (top10 >= 75) {
      score += 32;
    } else if (top10 >= 60) {
      score += 24;
    } else if (top10 >= 45) {
      score += 16;
    } else if (top10 >= 30) {
      score += 8;
    }

    // ========================================
    // HOLDER COUNT
    // ========================================

    const holders =
      holderData.totalHolders || 0;

    if (holders < 20) {
      score += 20;
    } else if (holders < 50) {
      score += 15;
    } else if (holders < 100) {
      score += 10;
    } else if (holders < 500) {
      score += 5;
    }

    // Maximum possible score = 100
    score = Math.min(Math.round(score), 100);

    // ========================================
    // RISK LABELS
    // ========================================

    if (score <= 20) {
      return {
        score,
        label: "LOW OBSERVED RISK",
        description:
          "Current holder distribution shows relatively low observed concentration risk.",
      };
    }

    if (score <= 40) {
      return {
        score,
        label: "MODERATE OBSERVED RISK",
        description:
          "Some concentration signals are present. Review the token carefully before making a decision.",
      };
    }

    if (score <= 60) {
      return {
        score,
        label: "ELEVATED RISK — CAUTIOUS",
        description:
          "The current distribution shows meaningful risk signals. Additional analysis is recommended.",
      };
    }

    if (score <= 80) {
      return {
        score,
        label: "HIGH RISK — JUMP",
        description:
          "Significant concentration risk has been detected. Extreme caution is advised.",
      };
    }

    return {
      score,
      label: "EXTREME RISK — JUMP",
      description:
        "Severe concentration signals have been detected. Avoid relying on this scan alone and exercise extreme caution.",
    };
  }

  const risk = calculateRiskScore();

  const tokenName =
    token?.content?.metadata?.name ||
    "Unknown Token";

  const tokenSymbol =
    token?.content?.metadata?.symbol ||
    token?.token_info?.symbol ||
    "UNKNOWN";

  const tokenImage =
    token?.content?.metadata?.image;

  const price =
    token?.token_info?.price_info
      ?.price_per_token;

  const currency =
    token?.token_info?.price_info?.currency ||
    "";

  return (
    <main className="min-h-screen bg-[#24070f] text-white">

      {/* ==========================================
          BACKGROUND
      ========================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute left-1/2 top-[-300px] h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-[#8f1738]/20 blur-3xl" />

        <div className="absolute bottom-[-300px] left-[-200px] h-[600px] w-[600px] rounded-full bg-[#5b1026]/30 blur-3xl" />

        <div className="absolute right-[-200px] top-[30%] h-[500px] w-[500px] rounded-full bg-[#9f2348]/10 blur-3xl" />

      </div>


      {/* ==========================================
          NAVBAR
      ========================================== */}

      <nav className="border-b border-white/[0.08] bg-[#1b050b]/70 backdrop-blur-xl">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-[#5d1026]">
              R
            </div>

            <div>

              <p className="text-sm font-bold tracking-wide">
                RUGREFLEX
              </p>

              <p className="hidden text-[10px] uppercase tracking-[0.2em] text-white/40 sm:block">
                Token Risk Intelligence
              </p>

            </div>

          </div>


          <div className="flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.05] px-3 py-1.5">

            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />

            <span className="text-xs text-white/60">
              Scanner Online
            </span>

          </div>

        </div>

      </nav>


      {/* ==========================================
          MAIN
      ========================================== */}

      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">

        {/* HERO */}

        <section className="mx-auto max-w-4xl text-center">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.05] px-4 py-2">

            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

            <span className="text-xs font-medium uppercase tracking-wider text-white/60">
              Solana Security Scanner
            </span>

          </div>


          <h1 className="text-5xl font-black tracking-[-0.04em] sm:text-7xl">

            Know the risk
            <br />

            <span className="text-white/45">
              before you buy.
            </span>

          </h1>


          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">

            RugReflex analyzes Solana tokens and
            exposes potential warning signs in
            seconds — including token data,
            holder concentration and wallet
            distribution.

          </p>

        </section>


        {/* ==========================================
            SCANNER
        ========================================== */}

        <section className="mx-auto mt-12 max-w-4xl">

          <div className="rounded-3xl border border-white/[0.10] bg-[#320914]/80 p-2 shadow-2xl shadow-black/40">

            <div className="rounded-[22px] border border-white/[0.06] bg-[#1d060c]/90 p-5 sm:p-7">

              <div className="mb-4 flex items-center justify-between">

                <div>

                  <p className="text-sm font-semibold text-white">
                    Scan a Solana token
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    Paste the token mint address below
                  </p>

                </div>


                <div className="hidden rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-wider text-white/40 sm:block">
                  Helius Powered
                </div>

              </div>


              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  type="text"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      scanToken();
                    }
                  }}
                  placeholder="Enter Solana token address..."
                  className="h-14 flex-1 rounded-xl border border-white/[0.10] bg-[#100308] px-4 font-mono text-sm text-white outline-none transition placeholder:text-white/25 focus:border-white/30 focus:ring-2 focus:ring-white/5"
                />


                <button
                  onClick={scanToken}
                  disabled={loading}
                  className="h-14 rounded-xl bg-white px-7 font-bold text-[#5d1026] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[170px]"
                >

                  {loading ? (

                    <span className="flex items-center justify-center gap-2">

                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#5d1026]/20 border-t-[#5d1026]" />

                      SCANNING

                    </span>

                  ) : (
                    "SCAN TOKEN →"
                  )}

                </button>

              </div>


              <div className="mt-4 flex items-center justify-between">

                <p className="text-[11px] text-white/25">
                  Press Enter to scan
                </p>

                {address && (

                  <button
                    onClick={clearScan}
                    className="text-[11px] text-white/40 transition hover:text-white"
                  >
                    Clear
                  </button>

                )}

              </div>


              {/* ERROR */}

              {error && (

                <div className="mt-5 rounded-xl border border-red-400/20 bg-red-500/[0.08] p-4">

                  <p className="text-sm font-medium text-red-300">
                    Scan failed
                  </p>

                  <p className="mt-1 text-xs text-red-300/70">
                    {error}
                  </p>

                </div>

              )}

            </div>

          </div>

        </section>


        {/* ==========================================
            RESULTS
        ========================================== */}

        {token && (

          <section className="mt-12">

            {/* TOKEN HEADER */}

            <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                {tokenImage ? (

                  <img
                    src={tokenImage}
                    alt={tokenName}
                    className="h-14 w-14 rounded-2xl border border-white/[0.10] object-cover"
                  />

                ) : (

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.10] bg-white/[0.05] text-xl font-black">
                    {tokenSymbol.slice(0, 1)}
                  </div>

                )}


                <div>

                  <div className="flex items-center gap-2">

                    <h2 className="text-xl font-bold">
                      {tokenName}
                    </h2>

                    <span className="rounded-md bg-white/[0.07] px-2 py-1 text-[10px] font-bold text-white/50">
                      ${tokenSymbol}
                    </span>

                  </div>


                  <div className="mt-1 flex items-center gap-2">

                    <span className="text-xs text-white/35">
                      Token scan complete
                    </span>

                    <span className="h-1 w-1 rounded-full bg-white/20" />

                    <button
                      onClick={copyAddress}
                      className="font-mono text-[10px] text-white/35 transition hover:text-white"
                    >
                      {copied
                        ? "Copied!"
                        : `${address.slice(
                            0,
                            6
                          )}...${address.slice(-6)}`}
                    </button>

                  </div>

                </div>

              </div>


              <span className="w-fit rounded-full border border-green-400/20 bg-green-400/[0.07] px-3 py-1.5 text-xs text-green-300">
                ✓ Data Retrieved
              </span>

            </div>


            {/* ======================================
                RISK SCORE
            ====================================== */}

            {holderData && (

              <section className="mb-8">

                <div className="overflow-hidden rounded-3xl border border-white/[0.10] bg-[#320914]/80">

                  <div className="border-b border-white/[0.07] px-6 py-5">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                          RugReflex Analysis
                        </p>

                        <h2 className="mt-2 text-2xl font-bold">
                          Observed Risk Score
                        </h2>

                      </div>

                      <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-wider text-white/35">
                        MVP Analysis
                      </div>

                    </div>

                  </div>


                  <div className="grid gap-8 p-6 lg:grid-cols-[280px_1fr] lg:p-8">

                    {/* SCORE */}

                    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#1b050b]/70 p-8 text-center">

                      <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                        Score
                      </p>


                      <div className="mt-4">

                        <span className="text-7xl font-black tracking-tight">
                          {risk.score}
                        </span>

                        <span className="ml-1 text-xl font-medium text-white/25">
                          /100
                        </span>

                      </div>


                      <div className="mt-5 rounded-full border border-white/[0.10] bg-white/[0.05] px-4 py-2">

                        <p className="text-xs font-bold tracking-wide text-white">
                          {risk.label}
                        </p>

                      </div>

                    </div>


                    {/* SCORE EXPLANATION */}

                    <div>

                      <div className="mb-6">

                        <p className="text-sm font-semibold text-white">
                          Risk Assessment
                        </p>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                          {risk.description}
                        </p>

                      </div>


                      {/* SCORE BAR */}

                      <div>

                        <div className="mb-2 flex justify-between text-[10px] uppercase tracking-wider text-white/30">

                          <span>
                            Lower Risk
                          </span>

                          <span>
                            Higher Risk
                          </span>

                        </div>


                        <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">

                          <div
                            className="h-full rounded-full bg-white transition-all duration-700"
                            style={{
                              width: `${risk.score}%`,
                            }}
                          />

                        </div>


                        <div className="mt-2 flex justify-between text-[10px] text-white/20">

                          <span>0</span>
                          <span>20</span>
                          <span>40</span>
                          <span>60</span>
                          <span>80</span>
                          <span>100</span>

                        </div>

                      </div>


                      {/* ======================================
                          RISK BANDS
                      ====================================== */}

                      <div className="mt-7 grid gap-2 sm:grid-cols-5">

                        {[
                          {
                            range: "0–20",
                            label: "LOW OBSERVED RISK",
                            min: 0,
                            max: 20,
                          },
                          {
                            range: "21–40",
                            label: "MODERATE OBSERVED RISK",
                            min: 21,
                            max: 40,
                          },
                          {
                            range: "41–60",
                            label: "ELEVATED RISK — CAUTIOUS",
                            min: 41,
                            max: 60,
                          },
                          {
                            range: "61–80",
                            label: "HIGH RISK — JUMP",
                            min: 61,
                            max: 80,
                          },
                          {
                            range: "81–100",
                            label: "EXTREME RISK — JUMP",
                            min: 81,
                            max: 100,
                          },
                        ].map((band) => {

                          const active =
                            risk.score >= band.min &&
                            risk.score <= band.max;

                          return (
                            <div
                              key={band.range}
                              className={`rounded-xl border p-3 transition-all duration-300 ${
                                active
                                  ? "border-white/30 bg-white/[0.10] shadow-lg"
                                  : "border-white/[0.06] bg-white/[0.025]"
                              }`}
                            >

                              <div className="flex items-center justify-between">

                                <p className="text-xs font-bold">
                                  {band.range}
                                </p>

                                {active && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">
                                    Current
                                  </span>
                                )}

                              </div>

                              <p
                                className={`mt-1 text-[9px] uppercase leading-4 ${
                                  active
                                    ? "text-white/80"
                                    : "text-white/30"
                                }`}
                              >
                                {band.label}
                              </p>

                            </div>
                          );

                        })}

                      </div>

                    </div>

                  </div>

                </div>

              </section>

            )}


            {/* ======================================
                TOKEN INFORMATION
            ====================================== */}

            <div className="mb-8">

              <div className="mb-5">

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                  Token
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Token Information
                </h2>

              </div>


              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl border border-white/[0.08] bg-[#320914]/70 p-5">

                  <p className="text-xs text-white/40">
                    Token Name
                  </p>

                  <p className="mt-3 truncate text-lg font-bold">
                    {tokenName}
                  </p>

                </div>


                <div className="rounded-2xl border border-white/[0.08] bg-[#320914]/70 p-5">

                  <p className="text-xs text-white/40">
                    Symbol
                  </p>

                  <p className="mt-3 text-lg font-bold">
                    ${tokenSymbol}
                  </p>

                </div>


                <div className="rounded-2xl border border-white/[0.08] bg-[#320914]/70 p-5">

                  <p className="text-xs text-white/40">
                    Total Supply
                  </p>

                  <p className="mt-3 text-lg font-bold">

                    {token.token_info?.supply?.toLocaleString() ||
                      "Unknown"}

                  </p>

                </div>


                <div className="rounded-2xl border border-white/[0.08] bg-[#320914]/70 p-5">

                  <p className="text-xs text-white/40">
                    Decimals
                  </p>

                  <p className="mt-3 text-lg font-bold">
                    {token.token_info?.decimals ??
                      "Unknown"}
                  </p>

                </div>

              </div>


              {token.token_info?.price_info && (

                <div className="mt-4 rounded-2xl border border-white/[0.08] bg-[#320914]/70 p-5">

                  <p className="text-xs text-white/40">
                    Current Token Price
                  </p>

                  <p className="mt-2 text-2xl font-bold">

                    {price?.toLocaleString(
                      undefined,
                      {
                        maximumFractionDigits: 8,
                      }
                    )}

                    <span className="ml-2 text-sm font-medium text-white/35">
                      {currency}
                    </span>

                  </p>

                </div>

              )}

            </div>


            {/* ======================================
                HOLDER ANALYSIS
            ====================================== */}

            {holderData && (

              <section>

                <div className="mb-5">

                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                    Distribution
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Holder Analysis
                  </h2>

                </div>


                {/* SUMMARY */}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <div className="rounded-2xl border border-white/[0.08] bg-[#320914]/70 p-5">

                    <p className="text-xs text-white/40">
                      Accounts Scanned
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {holderData.totalAccounts.toLocaleString()}
                    </p>

                  </div>


                  <div className="rounded-2xl border border-white/[0.08] bg-[#320914]/70 p-5">

                    <p className="text-xs text-white/40">
                      Holders Found
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {holderData.totalHolders.toLocaleString()}
                    </p>

                  </div>


                  <div className="rounded-2xl border border-white/[0.08] bg-[#320914]/70 p-5">

                    <p className="text-xs text-white/40">
                      Top Holder
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {holderData.topHolderPercentage}%
                    </p>

                  </div>


                  <div className="rounded-2xl border border-white/[0.08] bg-[#320914]/70 p-5">

                    <p className="text-xs text-white/40">
                      Top 10 Holders
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      {holderData.top10Percentage}%
                    </p>

                  </div>

                </div>


                {/* RISK DETAILS */}

                <div className="mt-4 grid gap-4 lg:grid-cols-2">

                  <div className="rounded-2xl border border-white/[0.08] bg-[#320914]/70 p-6">

                    <div className="flex items-center justify-between">

                      <p className="text-sm font-semibold">
                        Top Holder Concentration
                      </p>

                      <span className="text-xl font-black">
                        {holderData.topHolderPercentage}%
                      </span>

                    </div>


                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">

                      <div
                        className="h-full rounded-full bg-white"
                        style={{
                          width: `${Math.min(
                            holderData.topHolderPercentage,
                            100
                          )}%`,
                        }}
                      />

                    </div>


                    <p className="mt-3 text-xs text-white/30">
                      Percentage of supply controlled by
                      the largest detected holder.
                    </p>

                  </div>


                  <div className="rounded-2xl border border-white/[0.08] bg-[#320914]/70 p-6">

                    <div className="flex items-center justify-between">

                      <p className="text-sm font-semibold">
                        Top 10 Concentration
                      </p>

                      <span className="text-xl font-black">
                        {holderData.top10Percentage}%
                      </span>

                    </div>


                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">

                      <div
                        className="h-full rounded-full bg-white"
                        style={{
                          width: `${Math.min(
                            holderData.top10Percentage,
                            100
                          )}%`,
                        }}
                      />

                    </div>


                    <p className="mt-3 text-xs text-white/30">
                      Combined percentage held by the
                      largest ten detected holders.
                    </p>

                  </div>

                </div>


                {/* TOP HOLDERS TABLE */}

                <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#320914]/70">

                  <div className="flex flex-col gap-2 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <h3 className="font-bold">
                        Top Holders
                      </h3>

                      <p className="mt-1 text-xs text-white/30">
                        Largest wallets detected during
                        this scan
                      </p>

                    </div>


                    <span className="text-xs text-white/30">
                      Showing top 20
                    </span>

                  </div>


                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[650px] text-left">

                      <thead className="border-b border-white/[0.07]">

                        <tr className="text-[10px] uppercase tracking-wider text-white/30">

                          <th className="px-5 py-4">
                            Rank
                          </th>

                          <th className="px-5 py-4">
                            Wallet
                          </th>

                          <th className="px-5 py-4 text-right">
                            Amount
                          </th>

                          <th className="px-5 py-4 text-right">
                            Ownership
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {holderData.holders
                          .slice(0, 20)
                          .map(
                            (
                              holder,
                              index
                            ) => (

                              <tr
                                key={holder.owner}
                                className="border-b border-white/[0.04] transition hover:bg-white/[0.03]"
                              >

                                <td className="px-5 py-4">

                                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-xs font-bold text-white/50">
                                    {index + 1}
                                  </span>

                                </td>


                                <td className="px-5 py-4">

                                  <span className="font-mono text-xs text-white/50">

                                    {holder.owner.slice(
                                      0,
                                      10
                                    )}

                                    ...

                                    {holder.owner.slice(
                                      -8
                                    )}

                                  </span>

                                </td>


                                <td className="px-5 py-4 text-right font-mono text-xs text-white/60">

                                  {holder.amount.toLocaleString()}

                                </td>


                                <td className="px-5 py-4 text-right">

                                  {holder.percentage !==
                                  null ? (

                                    <div className="flex items-center justify-end gap-3">

                                      <div className="hidden h-1 w-16 overflow-hidden rounded-full bg-white/[0.06] sm:block">

                                        <div
                                          className="h-full rounded-full bg-white"
                                          style={{
                                            width: `${Math.min(
                                              holder.percentage,
                                              100
                                            )}%`,
                                          }}
                                        />

                                      </div>


                                      <span className="font-mono text-xs text-white/60">
                                        {holder.percentage}%
                                      </span>

                                    </div>

                                  ) : (

                                    <span className="text-xs text-white/25">
                                      N/A
                                    </span>

                                  )}

                                </td>

                              </tr>

                            )
                          )}

                      </tbody>

                    </table>

                  </div>

                </div>

              </section>

            )}

          </section>

        )}


        {/* ==========================================
            EMPTY STATE
        ========================================== */}

        {!token &&
          !loading &&
          !error && (

            <section className="mx-auto mt-16 max-w-4xl">

              <div className="grid gap-4 sm:grid-cols-3">

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm">
                    01
                  </div>

                  <h3 className="font-semibold">
                    Paste token
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-white/30">
                    Enter any Solana token mint address.
                  </p>

                </div>


                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm">
                    02
                  </div>

                  <h3 className="font-semibold">
                    Scan
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-white/30">
                    RugReflex retrieves token and holder
                    data.
                  </p>

                </div>


                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm">
                    03
                  </div>

                  <h3 className="font-semibold">
                    Assess risk
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-white/30">
                    Review the observed risk score and
                    holder distribution.
                  </p>

                </div>

              </div>

            </section>

          )}

      </div>


      {/* ==========================================
          FOOTER
      ========================================== */}

      <footer className="border-t border-white/[0.08]">

        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 sm:flex-row">

          <div>

            <p className="text-sm font-bold">
              RUGREFLEX
            </p>

            <p className="mt-1 text-xs text-white/25">
              Solana Token Risk Intelligence
            </p>

          </div>


          <p className="text-xs text-white/20">
            Observed risk analysis — not financial advice.
          </p>

        </div>

      </footer>

    </main>
  );
}