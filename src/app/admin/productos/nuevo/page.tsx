import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { leerParametro } from "@/lib/utilidades/parametros";
import { listarCategoriasActivas } from "@/servicios/categorias/listarCategoriasActivas";
import { listarMetodosPagoActivos } from "@/servicios/metodosPago/listarMetodosPagoActivos";
import { listarProveedoresActivos } from "@/servicios/proveedores/listarProveedoresActivos";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { FormularioProducto } from "@/componentes/productos/FormularioProducto";

export const metadata = { title: "Nuevo producto" };

export default async function PaginaNuevoProducto({
  searchParams,
}: PageProps<"/admin/productos/nuevo">) {
  await requerirAdmin();
  const params = await searchParams;
  const barcodeInicial = leerParametro(params.barcode);

  const [configuracion, categorias, metodosPago, proveedores] =
    await Promise.all([
      obtenerConfiguracionGeneral(),
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
        barcodeInicial={barcodeInicial}
        categorias={categorias}
        metodosPago={metodosPago}
        proveedores={proveedores}
        moneda={configuracion.moneda}
        locale={configuracion.locale}
      />
    </div>
  );
}
