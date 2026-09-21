import type { UnidadVenta } from "@/generated/prisma/enums";

// Formatea una cantidad de pedido según la modalidad de venta. Para kilogramos
// muestra hasta 3 decimales (gramos) con el sufijo "kg"; para unidad, sin
// decimales y con "unidad"/"unidades".
export function formatearCantidad(
  cantidad: number | string,
  unidadVenta: UnidadVenta,
  locale = "es-AR",
): string {
  const numero = typeof cantidad === "string" ? Number(cantidad) : cantidad;
  const valor = Number.isFinite(numero) ? numero : 0;

  if (unidadVenta === "KILOGRAMO") {
    const texto = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(valor);

    return `${texto} kg`;
  }

  const texto = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(valor);

  return valor === 1 ? `${texto} unidad` : `${texto} unidades`;
}
