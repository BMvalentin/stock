import { notFound } from "next/navigation";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { obtenerProducto } from "@/servicios/productos/obtenerProducto";
import { listarCategoriasActivas } from "@/servicios/categorias/listarCategoriasActivas";
import { listarMetodosPagoActivos } from "@/servicios/metodosPago/listarMetodosPagoActivos";
import { listarProveedoresActivos } from "@/servicios/proveedores/listarProveedoresActivos";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { FormularioProducto } from "@/componentes/productos/FormularioProducto";

export const metadata = { title: "Editar producto" };

export default async function PaginaEditarProducto({
  params,
}: PageProps<"/admin/productos/[id]/editar">) {
  await requerirAdmin();
  const { id } = await params;

  const [producto, configuracion, categorias, metodosPago, proveedores] =
    await Promise.all([
      obtenerProducto(id),
      obtenerConfiguracionGeneral(),
      listarCategoriasActivas(),
      listarMetodosPagoActivos(),
      listarProveedoresActivos(),
    ]);

  if (!producto) notFound();

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={`Editar ${producto.nombre}`}
        descripcion={producto.sku ? `SKU ${producto.sku}` : undefined}
      />
      <FormularioProducto
        producto={producto}
        categorias={categorias}
        metodosPago={metodosPago}
        proveedores={proveedores}
        moneda={configuracion.moneda}
        locale={configuracion.locale}
      />
    </div>
  );
}
