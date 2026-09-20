import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { leerParametro } from "@/lib/utilidades/parametros";
import { listarEmpleados } from "@/servicios/empleados/listarEmpleados";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { CampoBusqueda } from "@/componentes/ui/CampoBusqueda";
import { TablaEmpleados } from "@/componentes/empleados/TablaEmpleados";

export const metadata = { title: "Empleados" };

export default async function PaginaEmpleados({
  searchParams,
}: PageProps<"/empleados">) {
  const usuario = await requerirAdmin();
  const params = await searchParams;

  const busqueda = leerParametro(params.q);

  const [configuracion, empleados] = await Promise.all([
    obtenerConfiguracionGeneral(),
    listarEmpleados({ busqueda }),
  ]);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Empleados"
        descripcion="Gestioná los accesos y roles del equipo. Solo un administrador puede hacerlo."
      />

      <BarraFiltros baseHref="/empleados" limpiarHref="/empleados">
        <CampoBusqueda
          valorInicial={busqueda}
          placeholder="Buscar por nombre o correo"
          className="w-full sm:w-72"
        />
      </BarraFiltros>

      <TablaEmpleados
        empleados={empleados}
        usuarioActualId={usuario.id}
        locale={configuracion.locale}
      />
    </div>
  );
}
