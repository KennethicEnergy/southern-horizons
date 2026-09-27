const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });

/** Amounts are stored as integer centavos. */
export function formatPeso(centavos: number): string {
  const value = centavos / 100;
  return Number.isInteger(value)
    ? peso.format(value).replace(/\.00$/, "")
    : peso.format(value);
}

export function pesosToCentavos(pesos: number): number {
  return Math.round(pesos * 100);
}
