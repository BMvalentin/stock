import {
  Boxes,
  CircleAlert,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { obtenerResumenDashboard } from "@/servicios/dashboard/obtenerResumenDashboard";
import { obtenerProductosCriticos } from "@/servicios/dashboard/obtenerProductosCriticos";
import { obtenerPedidosRecientes } from "@/servicios/dashboard/obtenerPedidosRecientes";
import { obtenerMovimientosRecientes } from "@/servicios/dashboard/obtenerMovimientosRecientes";
import { obtenerVentasPorDia } from "@/servicios/dashboard/obtenerVentasPorDia";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { Alerta } from "@/componentes/ui/Alerta";
import { PanelSeccion } from "@/componentes/ui/PanelSeccion";
import { TarjetaMetrica } from "@/componentes/dashboard/TarjetaMetrica";
import { GraficoVentas } from "@/componentes/dashboard/GraficoVentas";
import { ListaStockCritico } from "@/componentes/dashboard/ListaStockCritico";
import { ListaPedidosRecientes } from "@/componentes/dashboard/ListaPedidosRecientes";
import { ListaMovimientosRecientes } from "@/componentes/dashboard/ListaMovimientosRecientes";

export const metadata = { title: "Dashboard" };

export default async function PaginaDashboard({
  searchParams,
}: PageProps<"/admin">) {
  const usuario = await requerirSesion();
  const params = await searchParams;

  const [configuracion, resumen, criticos, pedidos, movimientos, ventas] =
    await Promise.all([
      obtenerConfiguracionGeneral(),
      obtenerResumenDashboard(),
      obtenerProductosCriticos(),
      obtenerPedidosRecientes(),
      obtenerMovimientosRecientes(),
      obtenerVentasPorDia(),
    ]);

  const { moneda, locale } = configuracion;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={`Hola, ${usuario.nombre ?? usuario.email}`}
        descripcion="Resumen del mes en curso y lo que requiere atención."
      />

      {params.error === "sin-permiso" ? (
        <Alerta tono="advertencia">
          No tenés permisos para acceder a esa sección.
        </Alerta>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <TarjetaMetrica
          etiqueta="Vendido del mes"
          valor={formatearMoneda(resumen.totalVendidoPeriodo, moneda, locale)}
          tono="exito"
          icono={<TrendingUp className="h-4 w-4" strokeWidth={1.75} />}
        />
        <TarjetaMetrica
          etiqueta="Pedidos del mes"
          valor={String(resumen.pedidosPeriodo)}
          icono={<ShoppingCart className="h-4 w-4" strokeWidth={1.75} />}
          href="/admin/pedidos"
        />
        <TarjetaMetrica
          etiqueta="Pedidos pendientes"
          valor={String(resumen.pedidosPendientes)}
          tono={resumen.pedidosPendientes > 0 ? "alerta" : "neutral"}
          icono={<ShoppingCart className="h-4 w-4" strokeWidth={1.75} />}
          href="/admin/pedidos"
        />
        <TarjetaMetrica
          etiqueta="Productos activos"
          valor={String(resumen.productosActivos)}
          icono={<Package className="h-4 w-4" strokeWidth={1.75} />}
          href="/admin/productos"
        />
        <TarjetaMetrica
          etiqueta="Sin stock"
          valor={String(resumen.productosSinStock)}
          tono={resumen.productosSinStock > 0 ? "peligro" : "neutral"}
          icono={<CircleAlert className="h-4 w-4" strokeWidth={1.75} />}
          href="/admin/stock"
        />
        <TarjetaMetrica
          etiqueta="Stock bajo"
          valor={String(resumen.productosStockBajo)}
          tono={resumen.productosStockBajo > 0 ? "alerta" : "neutral"}
          icono={<Boxes className="h-4 w-4" strokeWidth={1.75} />}
          href="/admin/stock"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PanelSeccion
            titulo="Ventas de los últimos 14 días"
            descripcion="Pedidos no cancelados por día."
          >
            <GraficoVentas datos={ventas} moneda={moneda} locale={locale} />
          </PanelSeccion>
        </div>
        <PanelSeccion
          titulo="Requiere atención"
          descripcion="Productos con stock crítico."
          enlace="/admin/stock"
        >
          <ListaStockCritico productos={criticos} />
        </PanelSeccion>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PanelSeccion
          titulo="Pedidos recientes"
          enlace="/admin/pedidos"
          textoEnlace="Ver pedidos"
        >
          <ListaPedidosRecientes
            pedidos={pedidos}
            moneda={moneda}
            locale={locale}
          />
        </PanelSeccion>
        <PanelSeccion
          titulo="Movimientos recientes"
          enlace={usuario.rol === "ADMIN" ? "/admin/movimientos" : undefined}
          textoEnlace="Ver movimientos"
        >
          <ListaMovimientosRecientes
            movimientos={movimientos}
            locale={locale}
          />
        </PanelSeccion>
      </div>

      {usuario.rol === "EMPLEADO" ? (
        <p className="rounded-md bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
          Acceso de solo lectura. Las acciones administrativas no están
          disponibles para tu rol.
        </p>
      ) : null}
    </div>
  );
}
