import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { obtenerEmpleado } from "@/servicios/empleados/obtenerEmpleado";
import { obtenerLiquidacion } from "@/servicios/liquidaciones/obtenerLiquidacion";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import {
  ETIQUETAS_ESTADO_LIQUIDACION,
  TONOS_ESTADO_LIQUIDACION,
} from "@/constantes/estadosLiquidacion";
import { ETIQUETAS_TIPO_REMUNERACION } from "@/constantes/tiposRemuneracion";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearFechaCalendario } from "@/lib/utilidades/formatearFechaCalendario";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { EnlacesEmpleado } from "@/componentes/empleados/EnlacesEmpleado";
import { ResumenLiquidacion } from "@/componentes/empleados/ResumenLiquidacion";
import { AccionesLiquidacion } from "@/componentes/empleados/AccionesLiquidacion";

export const metadata = { title: "Detalle de liquidación" };

export default async function PaginaDetalleLiquidacion({
  params,
}: PageProps<"/admin/empleados/[id]/liquidacion/[liquidacionId]">) {
  await requerirAdmin();
  const { id, liquidacionId } = await params;

  const [configuracion, empleado, liquidacion] = await Promise.all([
    obtenerConfiguracionGeneral(),
    obtenerEmpleado(id),
    obtenerLiquidacion(liquidacionId),
  ]);

  if (!empleado || !liquidacion || liquidacion.empleadoId !== empleado.id) {
    notFound();
  }

  const { moneda, locale } = configuracion;
  const periodo = `${formatearFechaCalendario(liquidacion.desde, locale)} — ${formatearFechaCalendario(liquidacion.hasta, locale)}`;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={`Liquidación · ${empleado.nombre ?? empleado.email}`}
        descripcion={`Período ${periodo}.`}
        acciones={
          <EnlaceBoton
            href={`/admin/empleados/${empleado.userId}/liquidacion`}
            variante="secundario"
          >
            Volver
          </EnlaceBoton>
        }
      />

      <EnlacesEmpleado userId={empleado.userId} actual="liquidacion" />

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Modalidad
            </p>
            <p className="text-sm font-medium text-zinc-900">
              {ETIQUETAS_TIPO_REMUNERACION[liquidacion.tipoRemuneracion]}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Estado
            </p>
            <Etiqueta tono={TONOS_ESTADO_LIQUIDACION[liquidacion.estado]}>
              {ETIQUETAS_ESTADO_LIQUIDACION[liquidacion.estado]}
            </Etiqueta>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Total a pagar
            </p>
            <p className="text-xl font-semibold text-zinc-900">
              {formatearMoneda(liquidacion.total.toString(), moneda, locale)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <AccionesLiquidacion
            liquidacionId={liquidacion.id}
            estado={liquidacion.estado}
          />
        </div>
      </section>

      <ResumenLiquidacion
        detalle={liquidacion.detalle}
        moneda={moneda}
        locale={locale}
      />
    </div>
  );
}
