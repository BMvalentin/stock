import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { leerParametro } from "@/lib/utilidades/parametros";
import { listarProveedores } from "@/servicios/proveedores/listarProveedores";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { BarraFiltros } from "@/componentes/ui/BarraFiltros";
import { CampoBusqueda } from "@/componentes/ui/CampoBusqueda";
import { SelectFiltro } from "@/componentes/ui/SelectFiltro";
import { TablaProveedores } from "@/componentes/proveedores/TablaProveedores";

export const metadata = { title: "Proveedores" };

type EstadoFiltro = "ACTIVOS" | "INACTIVOS" | "TODOS";

export default async function PaginaProveedores({
  searchParams,
}: PageProps<"/proveedores">) {
  const usuario = await requerirSesion();
  const params = await searchParams;

  const busqueda = leerParametro(params.q);
  const estadoCrudo = leerParametro(params.estado);
  const estado: EstadoFiltro =
    estadoCrudo === "ACTIVOS" || estadoCrudo === "INACTIVOS"
      ? estadoCrudo
      : "TODOS";

  const proveedores = await listarProveedores({
    busqueda,
    estado,
    incluirCuentaPago: usuario.rol === "ADMIN",
  });

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Proveedores"
        descripcion="Contactá proveedores y consultá los productos asociados."
      />

      <BarraFiltros baseHref="/proveedores" limpiarHref="/proveedores">
        <CampoBusqueda
          valorInicial={busqueda}
          placeholder="Buscar por nombre, empresa o teléfono"
          className="w-full sm:w-72"
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

      <TablaProveedores
        proveedores={proveedores}
        esAdmin={usuario.rol === "ADMIN"}
      />
    </div>
  );
}
