import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";

export type FiltrosClientes = {
  busqueda?: string;
  estado?: "ACTIVOS" | "INACTIVOS" | "TODOS";
  pagina: number;
  porPagina: number;
};

export type ClienteListado = {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  localidad: string | null;
  activo: boolean;
  cantidadPedidos: number;
  totalComprado: number;
  ultimaCompra: Date | null;
};

export type ResultadoClientes = {
  clientes: ClienteListado[];
  total: number;
};

export async function listarClientes(
  filtros: FiltrosClientes,
): Promise<ResultadoClientes> {
  const where: Prisma.ClienteWhereInput = {
    ...(filtros.estado === "ACTIVOS"
      ? { activo: true }
      : filtros.estado === "INACTIVOS"
        ? { activo: false }
        : {}),
    ...(filtros.busqueda
      ? {
          OR: [
            { nombre: { contains: filtros.busqueda } },
            { telefono: { contains: filtros.busqueda } },
            { email: { contains: filtros.busqueda } },
          ],
        }
      : {}),
  };

  const [total, clientes] = await Promise.all([
    prisma.cliente.count({ where }),
    prisma.cliente.findMany({
      where,
      orderBy: [{ activo: "desc" }, { nombre: "asc" }],
      skip: (filtros.pagina - 1) * filtros.porPagina,
      take: filtros.porPagina,
      select: {
        id: true,
        nombre: true,
        telefono: true,
        email: true,
        localidad: true,
        activo: true,
        pedidos: {
          select: { total: true, createdAt: true, estado: true },
        },
      },
    }),
  ]);

  return {
    total,
    clientes: clientes.map((cliente) => {
      const validos = cliente.pedidos.filter(
        (pedido) => pedido.estado !== "CANCELADO",
      );
      const totalComprado = validos.reduce(
        (acumulado, pedido) => acumulado + Number(pedido.total),
        0,
      );
      const ultimaCompra =
        cliente.pedidos.length === 0
          ? null
          : cliente.pedidos.reduce(
              (maxima, pedido) =>
                pedido.createdAt > maxima ? pedido.createdAt : maxima,
              cliente.pedidos[0].createdAt,
            );

      return {
        id: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        email: cliente.email,
        localidad: cliente.localidad,
        activo: cliente.activo,
        cantidadPedidos: cliente.pedidos.length,
        totalComprado,
        ultimaCompra,
      };
    }),
  };
}
