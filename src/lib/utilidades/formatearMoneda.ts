const formateador = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

export function formatearMoneda(valor: number | string): string {
  const numero = typeof valor === "string" ? Number(valor) : valor;
  return formateador.format(Number.isFinite(numero) ? numero : 0);
}
