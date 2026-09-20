import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { listarCategoriasActivas } from "@/servicios/categorias/listarCategoriasActivas";
import { listarMetodosPagoActivos } from "@/servicios/metodosPago/listarMetodosPagoActivos";
import { listarProveedoresActivos } from "@/servicios/proveedores/listarProveedoresActivos";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { FormularioProducto } from "@/componentes/productos/FormularioProducto";

export const metadata = { title: "Nuevo producto" };

export default async function PaginaNuevoProducto() {
  await requerirAdmin();

  const [categorias, metodosPago, proveedores] = await Promise.all([
    listarCategoriasActivas(),
    listarMetodosPagoActivos(),
    listarProveedoresActivos(),
  ]);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Nuevo producto"
        descripcion="Completá la información básica, precios, stock y proveedores."
      />
      <FormularioProducto
        categorias={categorias}
        metodosPago={metodosPago}
        proveedores={proveedores}
      />
    </div>
  );
}
