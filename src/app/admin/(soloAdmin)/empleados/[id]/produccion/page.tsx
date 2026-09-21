import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { leerParametro } from "@/lib/utilidades/parametros";
import { calcularTotalPaginas } from "@/lib/utilidades/calcularTotalPaginas";
import { parsearFechaFiltro } from "@/lib/utilidades/parsearFechaFiltro";
import { esquemaPaginacion } from "@/lib/validaciones/paginacion";
import { obtenerEmpleado } from "@/servicios/empleados/obtenerEmpleado";
import { listarProducciones } from "@/servicios/producciones/listarProducciones";
import { listarTarifasProducto } from "@/servicios/tarifasProducto/listarTarifasProducto";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { fechaHoyCalendario } from "@/lib/utilidades/fechaHoyCalendario";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { Paginacion } from "@/componentes/ui/Paginacion";
import { Alerta } from "@/componentes/ui/Alerta";
import { EnlacesEmpleado } from "@/componentes/empleados/EnlacesEmpleado";
import { FormularioProduccion } from "@/componentes/empleados/FormularioProduccion";
import { TablaProducciones } from "@/componentes/empleados/TablaProducciones";

export const metadata = { title: "Producción" };

export default async function PaginaProduccionEmpleado({
  params,
  searchParams,
}: PageProps<"/admin/empleados/[id]/produccion">) {
  await requerirAdmin();
  const { id } = await params;
  const query = await searchParams;

  const [configuracion, empleado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    obtenerEmpleado(id),
  ]);

  if (!empleado) notFound();

  const esProduccion = empleado.tipoRemuneracion === "POR_PRODUCCION";

  const desde = parsearFechaFiltro(leerParametro(query.desde), false);
  const hasta = parsearFechaFiltro(leerParametro(query.hasta), true);
  const { pagina, porPagina } = esquemaPaginacion.parse({
    pagina: query.pagina,
    porPagina: query.porPagina,
  });

  const [resultado, tarifas] = await Promise.all([
    listarProducciones(empleado.id, { desde, hasta, pagina, porPagina }),
    listarTarifasProducto(empleado.id),
  ]);
  const totalPaginas = calcularTotalPaginas(resultado.total, porPagina);
  const baseHref = `/admin/empleados/${id}/produccion`;

  const productos = tarifas
    .filter((tarifa) => tarifa.activo)
    .map((tarifa) => ({
      valor: tarifa.productoId,
      etiqueta: `${tarifa.productoNombre} (${tarifa.productoSku})`,
    }));

  const fechaHoy = fechaHoyCalendario().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={`Producción · ${empleado.nombre ?? empleado.email}`}
        descripcion="Producción registrada y su cálculo por tarifa."
        acciones={
          <EnlaceBoton href="/admin/empleados" variante="secundario">
            Volver
          </EnlaceBoton>
        }
      />

      <EnlacesEmpleado userId={empleado.userId} actual="produccion" />

      {!esProduccion ? (
        <Alerta tono="info">
          Este empleado se remunera por hora. Cambiá la modalidad a «Por
          producción» en «Remuneración» para registrar producción.
        </Alerta>
      ) : null}

      {esProduccion ? (
        <FormularioProduccion
          empleadoId={empleado.id}
          fechaHoy={fechaHoy}
          productos={productos}
        />
      ) : null}

      <BarraFiltros baseHref={baseHref} limpiarHref={baseHref}>
        <input
          type="date"
          name="desde"
          defaultValue={leerParametro(query.desde) ?? ""}
          className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          aria-label="Desde"
        />
        <input
          type="date"
          name="hasta"
          defaultValue={leerParametro(query.hasta) ?? ""}
          className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
          aria-label="Hasta"
        />
      </BarraFiltros>

      <TablaProducciones
        producciones={resultado.producciones}
        moneda={configuracion.moneda}
        locale={configuracion.locale}
      />

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        totalRegistros={resultado.total}
        porPagina={porPagina}
        baseHref={baseHref}
        parametros={{
          desde: leerParametro(query.desde),
          hasta: leerParametro(query.hasta),
        }}
      />
    </div>
  );
}
