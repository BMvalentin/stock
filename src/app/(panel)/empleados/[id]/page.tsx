import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { obtenerEmpleado } from "@/servicios/empleados/obtenerEmpleado";
import { listarTarifasProducto } from "@/servicios/tarifasProducto/listarTarifasProducto";
import { listarProductosParaSeleccion } from "@/servicios/productos/listarProductosParaSeleccion";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { EnlacesEmpleado } from "@/componentes/empleados/EnlacesEmpleado";
import { SeccionRemuneracion } from "@/componentes/empleados/SeccionRemuneracion";
import { SeccionTarifas } from "@/componentes/empleados/SeccionTarifas";

export const metadata = { title: "Empleado" };

export default async function PaginaDetalleEmpleado({
  params,
}: PageProps<"/empleados/[id]">) {
  await requerirAdmin();
  const { id } = await params;

  const [configuracion, empleado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    obtenerEmpleado(id),
  ]);

  if (!empleado) notFound();

  const esProduccion = empleado.tipoRemuneracion === "POR_PRODUCCION";

  const tarifas = esProduccion
    ? await listarTarifasProducto(empleado.id)
    : [];
  const productos = esProduccion ? await listarProductosParaSeleccion() : [];

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={empleado.nombre ?? empleado.email}
        descripcion="Configuración de remuneración, asistencia, producción y liquidaciones."
        acciones={
          <EnlaceBoton href="/empleados" variante="secundario">
            Volver
          </EnlaceBoton>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
        <span>{empleado.email}</span>
        <Etiqueta tono={empleado.activo ? "exito" : "neutral"}>
          {empleado.activo ? "Activo" : "Inactivo"}
        </Etiqueta>
      </div>

      <EnlacesEmpleado userId={empleado.userId} actual="detalle" />

      <SeccionRemuneracion
        empleadoId={empleado.id}
        tipoInicial={empleado.tipoRemuneracion}
        horasInicial={empleado.horasJornada.toString()}
        pagoInicial={empleado.pagoJornada.toString()}
        entradaInicial={empleado.horaEntradaEsperada}
        salidaInicial={empleado.horaSalidaEsperada}
        entradaTramo2Inicial={empleado.horaEntradaTramo2Esperada ?? undefined}
        salidaTramo2Inicial={empleado.horaSalidaTramo2Esperada ?? undefined}
        moneda={configuracion.moneda}
        locale={configuracion.locale}
      />

      {esProduccion ? (
        <SeccionTarifas
          empleadoId={empleado.id}
          tarifas={tarifas}
          productos={productos}
          moneda={configuracion.moneda}
          locale={configuracion.locale}
        />
      ) : null}
    </div>
  );
}
