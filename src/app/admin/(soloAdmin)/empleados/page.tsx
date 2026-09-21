import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { leerParametro } from "@/lib/utilidades/parametros";
import { calcularTotalPaginas } from "@/lib/utilidades/calcularTotalPaginas";
import { esquemaPaginacion } from "@/lib/validaciones/paginacion";
import { listarEmpleados } from "@/servicios/empleados/listarEmpleados";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import type { Rol } from "@/generated/prisma/enums";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { CampoBusqueda } from "@/componentes/ui/CampoBusqueda";
import { SelectFiltro } from "@/componentes/ui/SelectFiltro";
import { Paginacion } from "@/componentes/ui/Paginacion";
import { TablaEmpleados } from "@/componentes/empleados/TablaEmpleados";

export const metadata = { title: "Empleados" };

type EstadoFiltro = "ACTIVOS" | "INACTIVOS" | "TODOS";

export default async function PaginaEmpleados({
  searchParams,
}: PageProps<"/admin/empleados">) {
  const usuario = await requerirAdmin();
  const params = await searchParams;

  const busqueda = leerParametro(params.q);
  const estadoCrudo = leerParametro(params.estado);
  const rolCrudo = leerParametro(params.rol);
  const estado: EstadoFiltro =
    estadoCrudo === "ACTIVOS" || estadoCrudo === "INACTIVOS"
      ? estadoCrudo
      : "TODOS";
  const rol: Rol | undefined =
    rolCrudo === "ADMIN" || rolCrudo === "EMPLEADO" ? rolCrudo : undefined;
  const { pagina, porPagina } = esquemaPaginacion.parse({
    pagina: params.pagina,
    porPagina: params.porPagina,
  });

  const [configuracion, resultado] = await Promise.all([
    obtenerConfiguracionGeneral(),
    listarEmpleados({ busqueda, rol, estado, pagina, porPagina }),
  ]);
  const totalPaginas = calcularTotalPaginas(resultado.total, porPagina);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Empleados"
        descripcion="Gestioná los accesos y roles del equipo. Solo un administrador puede hacerlo."
      />

      <BarraFiltros baseHref="/admin/empleados" limpiarHref="/admin/empleados">
        <CampoBusqueda
          valorInicial={busqueda}
          placeholder="Buscar por nombre o correo"
          className="w-full sm:w-72"
        />
        <SelectFiltro
          nombre="rol"
          valorInicial={rol}
          marcador="Todos los roles"
          opciones={[
            { valor: "ADMIN", etiqueta: "Administrador" },
            { valor: "EMPLEADO", etiqueta: "Empleado" },
          ]}
        />
        <SelectFiltro
          nombre="estado"
          valorInicial={estado === "TODOS" ? "" : estado}
          marcador="Todos los estados"
          opciones={[
            { valor: "ACTIVOS", etiqueta: "Activos" },
            { valor: "INACTIVOS", etiqueta: "Inactivos" },
          ]}
        />
      </BarraFiltros>

      <TablaEmpleados
        empleados={resultado.empleados}
        usuarioActualId={usuario.id}
        locale={configuracion.locale}
      />

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        totalRegistros={resultado.total}
        porPagina={porPagina}
        baseHref="/admin/empleados"
        parametros={{
          q: busqueda,
          rol,
          estado: estado === "TODOS" ? undefined : estado,
        }}
      />
    </div>
  );
}
