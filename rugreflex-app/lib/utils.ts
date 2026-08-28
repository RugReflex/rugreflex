export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "0";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "$0";

  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }

  return `$${value.toFixed(2)}`;
}

export function shortenAddress(
  address: string,
  start = 8,
  end = 6
): string {
  if (!address) return "";

  if (address.length <= start + end + 3) {
    return address;
  }

  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function getRiskLabel(score: number): {
  label: string;
  level: string;
} {
  if (score <= 20) {
    return {
      label: "LOW OBSERVED RISK",
      level: "LOW",
    };
  }

  if (score <= 40) {
    return {
      label: "MODERATE OBSERVED RISK",
      level: "MODERATE",
    };
  }

  if (score <= 60) {
    return {
      label: "ELEVATED OBSERVED RISK",
      level: "ELEVATED",
    };
  }

  if (score <= 80) {
    return {
      label: "HIGH OBSERVED RISK",
      level: "HIGH",
    };
  }

  return {
    label: "EXTREME OBSERVED RISK",
    level: "EXTREME",
  };
}

export function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(Math.max(value, min), max);
}
