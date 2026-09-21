import { prisma } from "@/lib/prisma/cliente";
import { ZONA_HORARIA } from "@/constantes/zonaHoraria";
import { rangoUltimosDias } from "@/lib/utilidades/rangoUltimosDias";
import { claveFechaEnZona } from "@/lib/utilidades/claveFechaEnZona";
import { sumarDiasCalendario } from "@/lib/utilidades/sumarDiasCalendario";
import { etiquetaDiaMesDesdeClave } from "@/lib/utilidades/etiquetaDiaMesDesdeClave";

export type VentaPorDia = {
  fecha: string;
  etiqueta: string;
  total: number;
};

// Serie de ventas (pedidos no cancelados) de los últimos N días, agrupada por
// día calendario del comercio. El volumen está acotado por el rango, por lo que
// se agrega en memoria.
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
  const claveInicio = claveFechaEnZona(inicio, ZONA_HORARIA);

  for (let indice = 0; indice < dias; indice += 1) {
    const clave = sumarDiasCalendario(claveInicio, indice);
    acumulados.set(clave, 0);
    etiquetas.set(clave, etiquetaDiaMesDesdeClave(clave));
  }

  for (const pedido of pedidos) {
    const clave = claveFechaEnZona(pedido.createdAt, ZONA_HORARIA);
    if (!acumulados.has(clave)) continue;
    acumulados.set(clave, (acumulados.get(clave) ?? 0) + Number(pedido.total));
  }

  return Array.from(acumulados.entries()).map(([fecha, total]) => ({
    fecha,
    etiqueta: etiquetas.get(fecha) ?? fecha,
    total,
  }));
}
