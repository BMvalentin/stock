import { prisma } from "@/lib/prisma/cliente";
import type { VentaPorDia } from "@/servicios/dashboard/obtenerVentasPorDia";

// Serie de ventas por día dentro de un rango. El volumen se acota a un máximo
// de 92 días para evitar consultas pesadas.
export async function obtenerVentasPorRango(
  desde: Date,
  hasta: Date,
): Promise<VentaPorDia[]> {
  const inicio = new Date(desde);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(hasta);
  fin.setHours(23, 59, 59, 999);

  const pedidos = await prisma.pedido.findMany({
    where: {
      createdAt: { gte: inicio, lte: fin },
      estado: { not: "CANCELADO" },
    },
    select: { createdAt: true, total: true },
  });

  const acumulados = new Map<string, number>();
  const etiquetas = new Map<string, string>();
  const cursor = new Date(inicio);
  let dias = 0;

  while (cursor <= fin && dias < 92) {
    const clave = cursor.toISOString().slice(0, 10);
    acumulados.set(clave, 0);
    etiquetas.set(
      clave,
      cursor.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
    );
    cursor.setDate(cursor.getDate() + 1);
    dias += 1;
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
