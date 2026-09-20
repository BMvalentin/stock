import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { obtenerResumenDashboard } from "@/servicios/dashboard/obtenerResumenDashboard";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";

export const metadata = { title: "Dashboard" };

function Tarjeta({
  etiqueta,
  valor,
  acento,
}: {
  etiqueta: string;
  valor: string;
  acento?: "alerta" | "ok";
}) {
  const color =
    acento === "alerta"
      ? "text-red-600"
      : acento === "ok"
        ? "text-emerald-600"
        : "text-zinc-900";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {etiqueta}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{valor}</p>
    </div>
  );
}

export default async function PaginaDashboard() {
  const usuario = await requerirSesion();
  const resumen = await obtenerResumenDashboard();

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-600">
          Hola {usuario.nombre ?? usuario.email}. Rol:{" "}
          <span className="font-medium">{usuario.rol}</span>.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tarjeta
          etiqueta="Vendido hoy"
          valor={formatearMoneda(resumen.totalVendidoHoy)}
          acento="ok"
        />
        <Tarjeta
          etiqueta="Pedidos del día"
          valor={String(resumen.pedidosDelDia)}
        />
        <Tarjeta
          etiqueta="Pedidos pendientes"
          valor={String(resumen.pedidosPendientes)}
        />
        <Tarjeta
          etiqueta="Movimientos del día"
          valor={String(resumen.movimientosDelDia)}
        />
        <Tarjeta
          etiqueta="Productos activos"
          valor={String(resumen.productosActivos)}
        />
        <Tarjeta
          etiqueta="Sin stock"
          valor={String(resumen.productosSinStock)}
          acento="alerta"
        />
        <Tarjeta
          etiqueta="Stock bajo"
          valor={String(resumen.productosStockBajo)}
          acento="alerta"
        />
      </div>

      {usuario.rol === "EMPLEADO" ? (
        <p className="rounded-md bg-zinc-200/60 px-4 py-3 text-sm text-zinc-700">
          Acceso de solo lectura. Las acciones administrativas no están
          disponibles para tu rol.
        </p>
      ) : null}
    </section>
  );
}
