const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const currencyCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function money(value: number): string {
  return currency.format(Math.round(value));
}

export function moneyCents(value: number): string {
  return currencyCents.format(value);
}

export function moneyMonthly(value: number): string {
  return `${currency.format(Math.round(value))}/mo`;
}

export function signedMoney(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded > 0 ? "+" : rounded < 0 ? "-" : "";
  return `${sign}${currency.format(Math.abs(rounded))}`;
}

export function compactNumber(value: number): string {
  return compact.format(value);
}

export function percent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

export function signedPercent(value: number, digits = 0): string {
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/** Linear rescale of `value` from [inMin, inMax] to [0, 100], clamped. */
export function rescale(
  value: number,
  inMin: number,
  inMax: number,
  invert = false,
): number {
  if (inMax === inMin) return 50;
  const t = clamp01((value - inMin) / (inMax - inMin));
  return (invert ? 1 - t : t) * 100;
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
