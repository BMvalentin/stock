import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { obtenerEmpleado } from "@/servicios/empleados/obtenerEmpleado";
import { listarProducciones } from "@/servicios/producciones/listarProducciones";
import { listarTarifasProducto } from "@/servicios/tarifasProducto/listarTarifasProducto";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { fechaHoyCalendario } from "@/lib/utilidades/fechaHoyCalendario";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { Alerta } from "@/componentes/ui/Alerta";
import { EnlacesEmpleado } from "@/componentes/empleados/EnlacesEmpleado";
import { FormularioProduccion } from "@/componentes/empleados/FormularioProduccion";
import { TablaProducciones } from "@/componentes/empleados/TablaProducciones";

export const metadata = { title: "Producción" };

export default async function PaginaProduccionEmpleado({
  params,
}: PageProps<"/empleados/[id]/produccion">) {
  await requerirAdmin();
  const { id } = await params;

  const [configuracion, empleado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    obtenerEmpleado(id),
  ]);

  if (!empleado) notFound();

  const esProduccion = empleado.tipoRemuneracion === "POR_PRODUCCION";

  const [producciones, tarifas] = await Promise.all([
    listarProducciones(empleado.id, { limite: 100 }),
    listarTarifasProducto(empleado.id),
  ]);

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
          <EnlaceBoton href="/empleados" variante="secundario">
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

      <TablaProducciones
        producciones={producciones}
        moneda={configuracion.moneda}
        locale={configuracion.locale}
      />
    </div>
  );
}
