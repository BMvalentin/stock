import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { obtenerEmpleado } from "@/servicios/empleados/obtenerEmpleado";
import { listarLiquidaciones } from "@/servicios/liquidaciones/listarLiquidaciones";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { fechaHoyCalendario } from "@/lib/utilidades/fechaHoyCalendario";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { EnlacesEmpleado } from "@/componentes/empleados/EnlacesEmpleado";
import { FormularioLiquidacion } from "@/componentes/empleados/FormularioLiquidacion";
import { TablaLiquidaciones } from "@/componentes/empleados/TablaLiquidaciones";

export const metadata = { title: "Liquidaciones" };

export default async function PaginaLiquidacionesEmpleado({
  params,
}: PageProps<"/empleados/[id]/liquidacion">) {
  await requerirAdmin();
  const { id } = await params;

  const [configuracion, empleado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    obtenerEmpleado(id),
  ]);

  if (!empleado) notFound();

  const liquidaciones = await listarLiquidaciones(empleado.id);

  const hoy = fechaHoyCalendario().toISOString().slice(0, 10);
  const desdeDefault = `${hoy.slice(0, 7)}-01`;

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={`Liquidaciones · ${empleado.nombre ?? empleado.email}`}
        descripcion="Historial y cálculo de remuneraciones por período."
        acciones={
          <EnlaceBoton href="/empleados" variante="secundario">
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

      <TablaLiquidaciones
        liquidaciones={liquidaciones}
        userId={empleado.userId}
        moneda={configuracion.moneda}
        locale={configuracion.locale}
      />
    </div>
  );
}
