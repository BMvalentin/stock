import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { crearAdaptador } from "../src/lib/prisma/crearAdaptador";
import type { EstadoPago, EstadoPedido } from "../src/generated/prisma/enums";

const prisma = new PrismaClient({ adapter: crearAdaptador() });

async function sembrarAdministrador(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? "admin@ejemplo.com")
    .trim()
    .toLowerCase();
  const contrasena = process.env.ADMIN_PASSWORD ?? "cambiar-esta-clave";
  const passwordHash = await bcrypt.hash(contrasena, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { rol: "ADMIN", activo: true, passwordHash },
    create: {
      email,
      name: "Administrador",
      rol: "ADMIN",
      activo: true,
      passwordHash,
    },
  });

  console.log(`Administrador: ${admin.email}`);
}

async function sembrarMetodosPago(): Promise<Record<string, string>> {
  const metodos = [
    { codigo: "EFECTIVO", nombre: "Efectivo", orden: 1 },
    { codigo: "TRANSFERENCIA", nombre: "Transferencia", orden: 2 },
  ];
  const ids: Record<string, string> = {};

  for (const metodo of metodos) {
    const registro = await prisma.metodoPago.upsert({
      where: { codigo: metodo.codigo },
      update: { nombre: metodo.nombre, orden: metodo.orden },
      create: metodo,
    });
    ids[metodo.codigo] = registro.id;
  }

  return ids;
}

async function sembrarConfiguracion(): Promise<void> {
  const general = await prisma.configuracionGeneral.findFirst();

  if (!general) {
    await prisma.configuracionGeneral.create({
      data: { nombreComercio: "Almacén de Barrio", moneda: "ARS", locale: "es-AR" },
    });
  }

  const envio = await prisma.configuracionEnvio.findFirst();

  if (!envio) {
    await prisma.configuracionEnvio.create({
      data: { tipo: "TARIFA_FIJA", precio: 3500, activo: true },
    });
  }
}

async function sembrarCatalogo(
  idsMetodosPago: Record<string, string>,
): Promise<void> {
  const categorias = ["Bebidas", "Almacén", "Limpieza", "Lácteos"];
  const idsCategorias: Record<string, string> = {};

  for (const nombre of categorias) {
    const categoria = await prisma.categoria.upsert({
      where: { nombre },
      update: { activo: true },
      create: { nombre },
    });
    idsCategorias[nombre] = categoria.id;
  }

  const proveedores = [
    {
      nombre: "Distribuidora del Sur",
      empresa: "Distribuidora del Sur S.A.",
      telefono: "+54 11 4555-1000",
      whatsapp: "+5491145551000",
      email: "ventas@delsur.com",
      direccion: "Av. Rivadavia 1200, CABA",
    },
    {
      nombre: "Almacén Central",
      empresa: "Almacén Central SRL",
      telefono: "+54 11 4555-2000",
      whatsapp: "+5491145552000",
      email: "pedidos@almacencentral.com",
    },
    {
      nombre: "Limpieza Total",
      empresa: null,
      telefono: "+54 11 4555-3000",
      whatsapp: null,
      email: "contacto@limpiezatotal.com",
    },
  ];

  for (const proveedor of proveedores) {
    await prisma.proveedor.create({ data: proveedor });
  }

  const productos = [
    { nombre: "Coca-Cola 2.25 L", sku: "BEB-COCA-225", categoria: "Bebidas", stock: 24, minimo: 10, efectivo: 3200, transferencia: 3000 },
    { nombre: "Agua Mineral 2 L", sku: "BEB-AGUA-2L", categoria: "Bebidas", stock: 40, minimo: 12, efectivo: 1500, transferencia: 1400 },
    { nombre: "Cerveza Quilmes 1 L", sku: "BEB-QUIL-1L", categoria: "Bebidas", stock: 6, minimo: 12, efectivo: 2800, transferencia: 2600 },
    { nombre: "Yerba Mate 1 kg", sku: "ALM-YERBA-1K", categoria: "Almacén", stock: 18, minimo: 8, efectivo: 6500, transferencia: 6200 },
    { nombre: "Arroz 1 kg", sku: "ALM-ARROZ-1K", categoria: "Almacén", stock: 30, minimo: 10, efectivo: 2100, transferencia: 2000 },
    { nombre: "Fideos 500 g", sku: "ALM-FIDEO-500", categoria: "Almacén", stock: 0, minimo: 15, efectivo: 1300, transferencia: 1200 },
    { nombre: "Detergente 750 ml", sku: "LIM-DETER-750", categoria: "Limpieza", stock: 14, minimo: 6, efectivo: 2400, transferencia: 2300 },
    { nombre: "Lavandina 1 L", sku: "LIM-LAVAN-1L", categoria: "Limpieza", stock: 3, minimo: 10, efectivo: 1700, transferencia: 1600 },
    { nombre: "Leche Entera 1 L", sku: "LAC-LECHE-1L", categoria: "Lácteos", stock: 22, minimo: 12, efectivo: 1900, transferencia: 1800 },
    { nombre: "Queso Cremoso 1 kg", sku: "LAC-QUESO-1K", categoria: "Lácteos", stock: 9, minimo: 5, efectivo: 8900, transferencia: 8600 },
  ];

  for (const producto of productos) {
    const creado = await prisma.producto.create({
      data: {
        nombre: producto.nombre,
        sku: producto.sku,
        categoriaId: idsCategorias[producto.categoria],
        stockActual: producto.stock,
        stockMinimo: producto.minimo,
      },
    });

    const precios = [
      { codigo: "EFECTIVO", precio: producto.efectivo },
      { codigo: "TRANSFERENCIA", precio: producto.transferencia },
    ];

    for (const precio of precios) {
      await prisma.precioProducto.create({
        data: {
          productoId: creado.id,
          metodoPagoId: idsMetodosPago[precio.codigo],
          precio: precio.precio,
        },
      });
    }
  }
}

async function sembrarClientes(): Promise<void> {
  const clientes = [
    { nombre: "María González", telefono: "+5491145550101", email: "maria@correo.com", direccion: "Av. Siempre Viva 742", localidad: "CABA" },
    { nombre: "Jorge Ramírez", telefono: "+5491145550102", email: "jorge@correo.com", direccion: "Calle Falsa 123", localidad: "Lanús" },
    { nombre: "Lucía Fernández", telefono: "+5491145550103", email: null, direccion: null, localidad: "San Isidro" },
    { nombre: "Carlos Pérez", telefono: "+5491145550104", email: "carlos@correo.com", direccion: "Belgrano 456", localidad: "Quilmes" },
  ];

  for (const cliente of clientes) {
    await prisma.cliente.create({ data: cliente });
  }
}

async function sembrarMovimientosIniciales(): Promise<void> {
  const admin = await prisma.user.findFirstOrThrow({ where: { rol: "ADMIN" } });
  const productos = await prisma.producto.findMany({
    select: { id: true, stockActual: true },
  });

  for (const producto of productos) {
    if (producto.stockActual <= 0) continue;

    await prisma.movimientoStock.create({
      data: {
        productoId: producto.id,
        tipo: "INGRESO",
        cantidad: producto.stockActual,
        stockAnterior: 0,
        stockPosterior: producto.stockActual,
        usuarioId: admin.id,
        motivo: "Carga inicial de stock",
      },
    });
  }
}

async function sembrarPedidosDemo(): Promise<void> {
  const admin = await prisma.user.findFirstOrThrow({ where: { rol: "ADMIN" } });
  const clientes = await prisma.cliente.findMany({
    take: 3,
    orderBy: { createdAt: "asc" },
  });
  const productos = await prisma.producto.findMany({
    where: { sku: { in: ["BEB-COCA-225", "ALM-YERBA-1K", "LIM-DETER-750"] } },
    include: { precios: true },
  });

  if (clientes.length === 0 || productos.length === 0) return;

  const pedidos: Array<{
    clienteId: string;
    estado: EstadoPedido;
    estadoPago: EstadoPago;
    descuentaStock: boolean;
    items: Array<{ sku: string; cantidad: number }>;
  }> = [
    {
      clienteId: clientes[0].id,
      estado: "ENTREGADO",
      estadoPago: "CONFIRMADO",
      descuentaStock: true,
      items: [
        { sku: "BEB-COCA-225", cantidad: 2 },
        { sku: "ALM-YERBA-1K", cantidad: 1 },
      ],
    },
    {
      clienteId: clientes[1].id,
      estado: "CONFIRMADO",
      estadoPago: "AVISADO",
      descuentaStock: true,
      items: [{ sku: "LIM-DETER-750", cantidad: 3 }],
    },
    {
      clienteId: clientes[2 % clientes.length].id,
      estado: "PENDIENTE",
      estadoPago: "PENDIENTE",
      descuentaStock: false,
      items: [{ sku: "ALM-YERBA-1K", cantidad: 2 }],
    },
  ];

  for (const datos of pedidos) {
    const items = datos.items.map((item) => {
      const producto = productos.find((p) => p.sku === item.sku);
      const precio = producto?.precios[0]?.precio ?? 0;
      const precioNumero = Number(precio);

      return {
        productoId: producto?.id ?? "",
        nombreProducto: producto?.nombre ?? "",
        precioUnitario: precioNumero,
        cantidad: item.cantidad,
        subtotal: precioNumero * item.cantidad,
      };
    });

    const subtotal = items.reduce((total, item) => total + item.subtotal, 0);
    const pedido = await prisma.pedido.create({
      data: {
        clienteId: datos.clienteId,
        usuarioId: admin.id,
        estado: datos.estado,
        estadoPago: datos.estadoPago,
        subtotal,
        costoEnvio: 0,
        total: subtotal,
        stockDescontado: datos.descuentaStock,
        detalles: { create: items },
      },
    });

    if (!datos.descuentaStock) continue;

    for (const item of items) {
      const producto = await prisma.producto.findUniqueOrThrow({
        where: { id: item.productoId },
        select: { stockActual: true },
      });
      const stockAnterior = producto.stockActual;
      const stockPosterior = Math.max(0, stockAnterior - item.cantidad);

      await prisma.movimientoStock.create({
        data: {
          productoId: item.productoId,
          tipo: "VENTA",
          cantidad: item.cantidad,
          stockAnterior,
          stockPosterior,
          usuarioId: admin.id,
          pedidoId: pedido.id,
          motivo: `Pedido #${pedido.numero}`,
        },
      });

      await prisma.producto.update({
        where: { id: item.productoId },
        data: { stockActual: stockPosterior },
      });
    }
  }
}

async function main(): Promise<void> {
  await sembrarAdministrador();
  const idsMetodosPago = await sembrarMetodosPago();
  await sembrarConfiguracion();
  await sembrarCatalogo(idsMetodosPago);
  await sembrarClientes();
  await sembrarMovimientosIniciales();
  await sembrarPedidosDemo();

  console.log("Seed completado.");
}

main()
  .catch((error) => {
    console.error("Error en el seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
