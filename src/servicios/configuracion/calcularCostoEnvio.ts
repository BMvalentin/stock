import { Prisma } from "@/generated/prisma/client";
import { obtenerConfiguracionEnvio } from "@/servicios/configuracion/obtenerConfiguracionEnvio";
import type { TipoEntrega } from "@/generated/prisma/enums";

export type LineaEnvio = {
  cantidad: number;
  unidadesPorBulto: number;
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

  // POR_BULTO: 1 producto = 1 bulto por defecto (`unidadesPorBulto` = 1).
  const bultos = lineas.reduce(
    (total, linea) => total + linea.cantidad / linea.unidadesPorBulto,
    0,
  );

  return precio.mul(bultos).toDecimalPlaces(2);
}
