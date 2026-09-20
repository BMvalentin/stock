const formateadores = new Map<string, Intl.NumberFormat>();

// Formatea un importe según la moneda y el locale configurados en el comercio.
export function formatearMoneda(
  valor: number | string,
  moneda = "ARS",
  locale = "es-AR",
): string {
  const numero = typeof valor === "string" ? Number(valor) : valor;
  const clave = `${locale}:${moneda}`;
  let formateador = formateadores.get(clave);

  if (!formateador) {
    formateador = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: moneda,
      minimumFractionDigits: 2,
    });
    formateadores.set(clave, formateador);
  }

  return formateador.format(Number.isFinite(numero) ? numero : 0);
}
