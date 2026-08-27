/* =========================================================
   RUGREFLEX — RISK ENGINE V2
   MVP TOKEN RISK INTELLIGENCE
   ========================================================= */

export type RiskLevel = {
  score: number;
  label: string;
  description: string;
};

export type RiskFlag = {
  type: "danger" | "warning" | "positive";
  title: string;
  description: string;
};

export type RiskInput = {
  topHolderPercentage: number;
  top10Percentage: number;
  totalHolders: number;

  mintAuthorityActive: boolean;
  freezeAuthorityActive: boolean;

  liquidityUsd?: number | null;
};

/* =========================================================
   HELPERS
   ========================================================= */

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/* =========================================================
   CALCULATE RISK
   ========================================================= */

export function calculateRisk(input: RiskInput): {
  risk: RiskLevel;
  flags: RiskFlag[];
} {
  let score = 0;

  const flags: RiskFlag[] = [];

  const topHolder = Math.max(
    0,
    input.topHolderPercentage || 0
  );

  const top10 = Math.max(
    0,
    input.top10Percentage || 0
  );

  const holders = Math.max(
    0,
    input.totalHolders || 0
  );

  const liquidity =
    input.liquidityUsd != null
      ? Math.max(0, input.liquidityUsd)
      : null;

  /* =======================================================
     1. TOP HOLDER CONCENTRATION
     Maximum: 25 points
     ======================================================= */

  let topHolderPoints = 0;

  if (topHolder >= 35) {
    topHolderPoints = 25;

    flags.push({
      type: "danger",
      title: "EXTREME TOP HOLDER CONCENTRATION",
      description:
        `The largest detected holder controls ${topHolder.toFixed(
          2
        )}% of the token supply.`,
    });
  } else if (topHolder >= 25) {
    topHolderPoints = 22;

    flags.push({
      type: "danger",
      title: "VERY HIGH TOP HOLDER CONCENTRATION",
      description:
        `The largest detected holder controls ${topHolder.toFixed(
          2
        )}% of the token supply.`,
    });
  } else if (topHolder >= 15) {
    topHolderPoints = 18;

    flags.push({
      type: "danger",
      title: "HIGH TOP HOLDER CONCENTRATION",
      description:
        `The largest detected holder controls ${topHolder.toFixed(
          2
        )}% of the token supply.`,
    });
  } else if (topHolder >= 10) {
    topHolderPoints = 13;

    flags.push({
      type: "warning",
      title: "NOTABLE TOP HOLDER CONCENTRATION",
      description:
        `The largest detected holder controls ${topHolder.toFixed(
          2
        )}% of the token supply.`,
    });
  } else if (topHolder >= 5) {
    topHolderPoints = 7;

    flags.push({
      type: "warning",
      title: "MODERATE TOP HOLDER CONCENTRATION",
      description:
        `The largest detected holder controls ${topHolder.toFixed(
          2
        )}% of the token supply.`,
    });
  } else if (topHolder >= 2) {
    topHolderPoints = 3;

    flags.push({
      type: "positive",
      title: "LOW TOP HOLDER CONCENTRATION",
      description:
        `The largest detected holder controls ${topHolder.toFixed(
          2
        )}% of the token supply.`,
    });
  } else {
    flags.push({
      type: "positive",
      title: "LOW TOP HOLDER CONCENTRATION",
      description:
        `The largest detected holder controls only ${topHolder.toFixed(
          2
        )}% of the token supply.`,
    });
  }

  score += topHolderPoints;

  /* =======================================================
     2. TOP 10 CONCENTRATION
     Maximum: 25 points
     ======================================================= */

  let top10Points = 0;

  if (top10 >= 80) {
    top10Points = 25;

    flags.push({
      type: "danger",
      title: "EXTREME TOP 10 CONCENTRATION",
      description:
        `The largest ten detected holders control ${top10.toFixed(
          2
        )}% of the token supply.`,
    });
  } else if (top10 >= 60) {
    top10Points = 22;

    flags.push({
      type: "danger",
      title: "VERY HIGH TOP 10 CONCENTRATION",
      description:
        `The largest ten detected holders control ${top10.toFixed(
          2
        )}% of the token supply.`,
    });
  } else if (top10 >= 45) {
    top10Points = 17;

    flags.push({
      type: "danger",
      title: "HIGH TOP 10 CONCENTRATION",
      description:
        `The largest ten detected holders control ${top10.toFixed(
          2
        )}% of the token supply.`,
    });
  } else if (top10 >= 30) {
    top10Points = 12;

    flags.push({
      type: "warning",
      title: "NOTABLE TOP 10 CONCENTRATION",
      description:
        `The largest ten detected holders control ${top10.toFixed(
          2
        )}% of the token supply.`,
    });
  } else if (top10 >= 20) {
    top10Points = 7;

    flags.push({
      type: "warning",
      title: "MODERATE TOP 10 CONCENTRATION",
      description:
        `The largest ten detected holders control ${top10.toFixed(
          2
        )}% of the token supply.`,
    });
  } else if (top10 >= 10) {
    top10Points = 3;

    flags.push({
      type: "positive",
      title: "RELATIVELY BROAD TOP 10 DISTRIBUTION",
      description:
        `The largest ten detected holders control ${top10.toFixed(
          2
        )}% of the token supply.`,
    });
  } else {
    flags.push({
      type: "positive",
      title: "DISTRIBUTION LOOKS BROAD",
      description:
        `The largest ten detected holders control ${top10.toFixed(
          2
        )}% of the token supply.`,
    });
  }

  score += top10Points;

  /* =======================================================
     3. HOLDER COUNT
     Maximum: 15 points
     ======================================================= */

  if (holders < 20) {
    score += 15;

    flags.push({
      type: "danger",
      title: "VERY FEW HOLDERS",
      description:
        `Only ${holders.toLocaleString()} holders were detected.`,
    });
  } else if (holders < 50) {
    score += 12;

    flags.push({
      type: "danger",
      title: "LOW HOLDER COUNT",
      description:
        `Only ${holders.toLocaleString()} holders were detected.`,
    });
  } else if (holders < 100) {
    score += 9;

    flags.push({
      type: "warning",
      title: "LIMITED HOLDER BASE",
      description:
        `${holders.toLocaleString()} holders were detected.`,
    });
  } else if (holders < 250) {
    score += 6;

    flags.push({
      type: "warning",
      title: "SMALL HOLDER BASE",
      description:
        `${holders.toLocaleString()} holders were detected.`,
    });
  } else if (holders < 500) {
    score += 3;

    flags.push({
      type: "positive",
      title: "DEVELOPING HOLDER BASE",
      description:
        `${holders.toLocaleString()} holders were detected.`,
    });
  } else {
    flags.push({
      type: "positive",
      title: "LARGE HOLDER BASE",
      description:
        `${holders.toLocaleString()} holders were detected.`,
    });
  }

  /* =======================================================
     4. LIQUIDITY
     Maximum: 20 points
     ======================================================= */

  if (liquidity === null) {
    flags.push({
      type: "warning",
      title: "LIQUIDITY DATA UNAVAILABLE",
      description:
        "RugReflex could not confirm active liquidity data during this scan.",
    });
  } else if (liquidity === 0) {
    score += 20;

    flags.push({
      type: "danger",
      title: "NO LIQUIDITY DETECTED",
      description:
        "No available liquidity was detected for the identified trading pool.",
    });
  } else if (liquidity < 5_000) {
    score += 20;

    flags.push({
      type: "danger",
      title: "VERY LOW LIQUIDITY",
      description:
        `The largest detected liquidity pool has approximately $${liquidity.toLocaleString(
          undefined,
          { maximumFractionDigits: 0 }
        )} in liquidity.`,
    });
  } else if (liquidity < 10_000) {
    score += 16;

    flags.push({
      type: "danger",
      title: "LOW LIQUIDITY",
      description:
        `The largest detected liquidity pool has approximately $${liquidity.toLocaleString(
          undefined,
          { maximumFractionDigits: 0 }
        )} in liquidity.`,
    });
  } else if (liquidity < 25_000) {
    score += 11;

    flags.push({
      type: "warning",
      title: "LIMITED LIQUIDITY",
      description:
        `The largest detected liquidity pool has approximately $${liquidity.toLocaleString(
          undefined,
          { maximumFractionDigits: 0 }
        )} in liquidity.`,
    });
  } else if (liquidity < 50_000) {
    score += 7;

    flags.push({
      type: "warning",
      title: "MODERATE LIQUIDITY",
      description:
        `The largest detected liquidity pool has approximately $${liquidity.toLocaleString(
          undefined,
          { maximumFractionDigits: 0 }
        )} in liquidity.`,
    });
  } else if (liquidity < 100_000) {
    score += 4;

    flags.push({
      type: "positive",
      title: "HEALTHIER LIQUIDITY",
      description:
        `The largest detected liquidity pool has approximately $${liquidity.toLocaleString(
          undefined,
          { maximumFractionDigits: 0 }
        )} in liquidity.`,
    });
  } else {
    flags.push({
      type: "positive",
      title: "STRONGER LIQUIDITY",
      description:
        "The largest detected liquidity pool has at least $100,000 in liquidity.",
    });
  }

  /* =======================================================
     5. MINT AUTHORITY
     Maximum: 7.5 points
     ======================================================= */

  if (input.mintAuthorityActive) {
    score += 7.5;

    flags.push({
      type: "danger",
      title: "MINT AUTHORITY ACTIVE",
      description:
        "The token's mint authority is still active and may allow additional tokens to be minted.",
    });
  } else {
    flags.push({
      type: "positive",
      title: "MINT AUTHORITY REVOKED",
      description:
        "No active mint authority was detected during this scan.",
    });
  }

  /* =======================================================
     6. FREEZE AUTHORITY
     Maximum: 7.5 points
     ======================================================= */

  if (input.freezeAuthorityActive) {
    score += 7.5;

    flags.push({
      type: "danger",
      title: "FREEZE AUTHORITY ACTIVE",
      description:
        "The token's freeze authority is still active and may allow token accounts to be frozen.",
    });
  } else {
    flags.push({
      type: "positive",
      title: "FREEZE AUTHORITY REVOKED",
      description:
        "No active freeze authority was detected during this scan.",
    });
  }

  /* =======================================================
     FINAL SCORE
     Maximum theoretical score: 100
     ======================================================= */

  score = clamp(Math.round(score), 0, 100);

  /* =======================================================
     RISK LEVEL
     ======================================================= */

  let risk: RiskLevel;

  if (score <= 20) {
    risk = {
      score,
      label: "LOW OBSERVED RISK",
      description:
        "The checks performed by RugReflex found relatively few significant risk signals. This does not mean the token is safe.",
    };
  } else if (score <= 40) {
    risk = {
      score,
      label: "MODERATE OBSERVED RISK",
      description:
        "Some concentration, liquidity, holder-base, or token-security signals were detected. Review the identified warnings before making a decision.",
    };
  } else if (score <= 60) {
    risk = {
      score,
      label: "ELEVATED RISK — CAUTIOUS",
      description:
        "The current checks show meaningful risk signals. Additional investigation is recommended before interacting with the token.",
    };
  } else if (score <= 80) {
    risk = {
      score,
      label: "HIGH RISK — JUMP",
      description:
        "Multiple significant risk signals were detected. Extreme caution is advised.",
    };
  } else {
    risk = {
      score,
      label: "EXTREME RISK — JUMP",
      description:
        "Severe risk signals were detected across the checks currently performed. Do not rely on this scan alone.",
    };
  }

  return {
    risk,
    flags,
  };
}
