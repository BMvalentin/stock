import { Prisma } from "@/generated/prisma/client";
import { obtenerConfiguracionEnvio } from "@/servicios/configuracion/obtenerConfiguracionEnvio";
import type { TipoEntrega } from "@/generated/prisma/enums";

export type LineaEnvio = {
  // Cantidad vendida (unidades o kg según la modalidad de la línea).
  cantidad: number;
  // Bultos equivalentes ya calculados por el servicio de totales. Una venta
  // suelta cuenta la fracción de bulto que consume.
  bultos: number;
};

// Calcula el costo de envío según la configuración vigente del comercio. El
// retiro en el local no tiene costo. Reutiliza `ConfiguracionEnvio`; no
// hardcodea tarifas ni duplica la lógica en componentes.
export async function calcularCostoEnvio(
  tipoEntrega: TipoEntrega,
  lineas: LineaEnvio[],
): Promise<Prisma.Decimal> {
  if (tipoEntrega === "RETIRO") {
    return new Prisma.Decimal(0);
  }

  const configuracion = await obtenerConfiguracionEnvio();

  if (!configuracion.activo || configuracion.tipo === "SIN_CARGO") {
    return new Prisma.Decimal(0);
  }

  const precio = new Prisma.Decimal(configuracion.precio);

  if (configuracion.tipo === "TARIFA_FIJA") {
    return precio.toDecimalPlaces(2);
  }

  if (configuracion.tipo === "POR_PRODUCTO") {
    const unidades = lineas.reduce(
      (total, linea) => total + linea.cantidad,
      0,
    );

    return precio.mul(unidades).toDecimalPlaces(2);
  }

  // POR_BULTO: los bultos los calcula el servicio de totales, considerando la
  // presentación (`pesoPresentacionKg`) o `unidadesPorBulto` según el producto.
  const bultos = lineas.reduce((total, linea) => total + linea.bultos, 0);

  return precio.mul(bultos).toDecimalPlaces(2);
}
