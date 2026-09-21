import { Prisma } from "@/generated/prisma/client";

export type ProduccionCalculo = {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnidad: Prisma.Decimal | string;
  total: Prisma.Decimal | string;
};

export type LineaProduccionCalculada = {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnidad: string;
  total: string;
};

export type ResumenRemuneracionProduccion = {
  lineas: LineaProduccionCalculada[];
  total: string;
};

// Agrupa la producción por producto y precio unitario histórico. Se agrupa
// también por precio para no mezclar tarifas distintas de un mismo producto en
// un período donde cambió el precio.
export function calcularRemuneracionProduccion(
  producciones: ProduccionCalculo[],
): ResumenRemuneracionProduccion {
  const grupos = new Map<string, LineaProduccionCalculada>();

  for (const produccion of producciones) {
    const precio = new Prisma.Decimal(produccion.precioUnidad).toFixed(2);
    const clave = `${produccion.productoId}|${precio}`;
    const existente = grupos.get(clave);
    const total = new Prisma.Decimal(produccion.total);

    if (existente) {
      existente.cantidad += produccion.cantidad;
      existente.total = new Prisma.Decimal(existente.total)
        .add(total)
        .toFixed(2);
      continue;
    }

    grupos.set(clave, {
      productoId: produccion.productoId,
      productoNombre: produccion.productoNombre,
      cantidad: produccion.cantidad,
      precioUnidad: precio,
      total: total.toFixed(2),
    });
  }

  const lineas = Array.from(grupos.values()).sort((a, b) =>
    a.productoNombre.localeCompare(b.productoNombre),
  );

  const total = lineas.reduce(
    (acumulado, linea) => acumulado.add(new Prisma.Decimal(linea.total)),
    new Prisma.Decimal(0),
  );

  return { lineas, total: total.toFixed(2) };
}
