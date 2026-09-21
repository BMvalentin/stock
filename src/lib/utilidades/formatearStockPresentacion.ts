// Formatea el stock de un producto con venta suelta mostrando los kilogramos
// disponibles y su equivalencia en bolsas. Ej.: "60 kg · 4 bolsas" o
// "62 kg · 4 bolsas + 2 kg". Sin peso de presentación devuelve solo los kg.
export function formatearStockPresentacion(
  cantidadKg: number | string,
  pesoPresentacionKg: number | null | undefined,
  locale = "es-AR",
): string {
  const kg = typeof cantidadKg === "string" ? Number(cantidadKg) : cantidadKg;
  const kgValido = Number.isFinite(kg) ? kg : 0;

  const formatearKg = (valor: number) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(valor);

  const textoKg = `${formatearKg(kgValido)} kg`;

  if (!pesoPresentacionKg || pesoPresentacionKg <= 0) return textoKg;

  const bolsas = Math.floor(kgValido / pesoPresentacionKg);
  const resto = Number((kgValido - bolsas * pesoPresentacionKg).toFixed(3));
  const textoBolsas = bolsas === 1 ? "1 bolsa" : `${bolsas} bolsas`;

  if (resto <= 0) return `${textoKg} · ${textoBolsas}`;

  return `${textoKg} · ${textoBolsas} + ${formatearKg(resto)} kg`;
}
