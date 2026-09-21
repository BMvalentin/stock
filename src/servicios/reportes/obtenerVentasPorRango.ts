import { prisma } from "@/lib/prisma/cliente";
import { ZONA_HORARIA } from "@/constantes/zonaHoraria";
import type { VentaPorDia } from "@/servicios/dashboard/obtenerVentasPorDia";
import { claveFechaEnZona } from "@/lib/utilidades/claveFechaEnZona";
import { sumarDiasCalendario } from "@/lib/utilidades/sumarDiasCalendario";
import { etiquetaDiaMesDesdeClave } from "@/lib/utilidades/etiquetaDiaMesDesdeClave";

// Serie de ventas por día dentro de un rango. Los extremos se reciben como
// instantes UTC ya calculados para el calendario del comercio. El volumen se
// acota a un máximo de 92 días para evitar consultas pesadas.
export async function obtenerVentasPorRango(
  desde: Date,
  hasta: Date,
): Promise<VentaPorDia[]> {
  const pedidos = await prisma.pedido.findMany({
    where: {
      createdAt: { gte: desde, lte: hasta },
      estado: { not: "CANCELADO" },
    },
    select: { createdAt: true, total: true },
  });

  const acumulados = new Map<string, number>();
  const etiquetas = new Map<string, string>();
  const claveInicio = claveFechaEnZona(desde, ZONA_HORARIA);
  const claveFin = claveFechaEnZona(hasta, ZONA_HORARIA);
  let clave = claveInicio;
  let dias = 0;

  while (clave <= claveFin && dias < 92) {
    acumulados.set(clave, 0);
    etiquetas.set(clave, etiquetaDiaMesDesdeClave(clave));
    clave = sumarDiasCalendario(clave, 1);
    dias += 1;
  }

  for (const pedido of pedidos) {
    const clavePedido = claveFechaEnZona(pedido.createdAt, ZONA_HORARIA);
    if (!acumulados.has(clavePedido)) continue;
    acumulados.set(
      clavePedido,
      (acumulados.get(clavePedido) ?? 0) + Number(pedido.total),
    );
  }

  return Array.from(acumulados.entries()).map(([fecha, total]) => ({
    fecha,
    etiqueta: etiquetas.get(fecha) ?? fecha,
    total,
  }));
}
