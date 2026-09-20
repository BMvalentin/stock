import { prisma } from "@/lib/prisma/cliente";
import { rangoUltimosDias } from "@/lib/utilidades/rangoUltimosDias";

export type VentaPorDia = {
  fecha: string;
  etiqueta: string;
  total: number;
};

// Serie de ventas (pedidos no cancelados) de los últimos N días, agrupada por
// día. El volumen está acotado por el rango, por lo que se agrega en memoria.
export async function obtenerVentasPorDia(dias = 14): Promise<VentaPorDia[]> {
  const { inicio, fin } = rangoUltimosDias(dias);

  const pedidos = await prisma.pedido.findMany({
    where: {
      createdAt: { gte: inicio, lte: fin },
      estado: { not: "CANCELADO" },
    },
    select: { createdAt: true, total: true },
  });

  const acumulados = new Map<string, number>();
  const etiquetas = new Map<string, string>();

  for (let indice = 0; indice < dias; indice += 1) {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + indice);
    const clave = dia.toISOString().slice(0, 10);
    acumulados.set(clave, 0);
    etiquetas.set(
      clave,
      dia.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
    );
  }

  for (const pedido of pedidos) {
    const clave = pedido.createdAt.toISOString().slice(0, 10);
    if (!acumulados.has(clave)) continue;
    acumulados.set(clave, (acumulados.get(clave) ?? 0) + Number(pedido.total));
  }

  return Array.from(acumulados.entries()).map(([fecha, total]) => ({
    fecha,
    etiqueta: etiquetas.get(fecha) ?? fecha,
    total,
  }));
}
