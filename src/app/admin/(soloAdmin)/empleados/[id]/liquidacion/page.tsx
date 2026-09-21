import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { leerParametro } from "@/lib/utilidades/parametros";
import { calcularTotalPaginas } from "@/lib/utilidades/calcularTotalPaginas";
import { esquemaPaginacion } from "@/lib/validaciones/paginacion";
import { obtenerEmpleado } from "@/servicios/empleados/obtenerEmpleado";
import { listarLiquidaciones } from "@/servicios/liquidaciones/listarLiquidaciones";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { fechaHoyCalendario } from "@/lib/utilidades/fechaHoyCalendario";
import {
  ETIQUETAS_ESTADO_LIQUIDACION,
  ESTADOS_LIQUIDACION,
} from "@/constantes/estadosLiquidacion";
import type { EstadoLiquidacion } from "@/generated/prisma/enums";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { SelectFiltro } from "@/componentes/ui/SelectFiltro";
import { Paginacion } from "@/componentes/ui/Paginacion";
import { EnlacesEmpleado } from "@/componentes/empleados/EnlacesEmpleado";
import { FormularioLiquidacion } from "@/componentes/empleados/FormularioLiquidacion";
import { TablaLiquidaciones } from "@/componentes/empleados/TablaLiquidaciones";

export const metadata = { title: "Liquidaciones" };

export default async function PaginaLiquidacionesEmpleado({
  params,
  searchParams,
}: PageProps<"/admin/empleados/[id]/liquidacion">) {
  await requerirAdmin();
  const { id } = await params;
  const query = await searchParams;

  const [configuracion, empleado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    obtenerEmpleado(id),
  ]);

  if (!empleado) notFound();

  const estadoCrudo = leerParametro(query.estado);
  const estado: EstadoLiquidacion | undefined = ESTADOS_LIQUIDACION.includes(
    estadoCrudo as EstadoLiquidacion,
  )
    ? (estadoCrudo as EstadoLiquidacion)
    : undefined;
  const { pagina, porPagina } = esquemaPaginacion.parse({
    pagina: query.pagina,
    porPagina: query.porPagina,
  });

  const resultado = await listarLiquidaciones(empleado.id, {
    estado,
    pagina,
    porPagina,
  });
  const totalPaginas = calcularTotalPaginas(resultado.total, porPagina);
  const baseHref = `/admin/empleados/${id}/liquidacion`;

  const hoy = fechaHoyCalendario().toISOString().slice(0, 10);
  const desdeDefault = `${hoy.slice(0, 7)}-01`;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={`Liquidaciones · ${empleado.nombre ?? empleado.email}`}
        descripcion="Historial y cálculo de remuneraciones por período."
        acciones={
          <EnlaceBoton href="/admin/empleados" variante="secundario">
            Volver
          </EnlaceBoton>
        }
      />

      <EnlacesEmpleado userId={empleado.userId} actual="liquidacion" />

      <FormularioLiquidacion
        empleadoId={empleado.id}
        desdeDefault={desdeDefault}
        hastaDefault={hoy}
      />

      <BarraFiltros baseHref={baseHref} limpiarHref={baseHref}>
        <SelectFiltro
          nombre="estado"
          valorInicial={estado}
          marcador="Todos los estados"
          opciones={ESTADOS_LIQUIDACION.map((valor) => ({
            valor,
            etiqueta: ETIQUETAS_ESTADO_LIQUIDACION[valor],
          }))}
        />
      </BarraFiltros>

      <TablaLiquidaciones
        liquidaciones={resultado.liquidaciones}
        userId={empleado.userId}
        moneda={configuracion.moneda}
        locale={configuracion.locale}
      />

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        totalRegistros={resultado.total}
        porPagina={porPagina}
        baseHref={baseHref}
        parametros={{ estado }}
      />
    </div>
  );
}
