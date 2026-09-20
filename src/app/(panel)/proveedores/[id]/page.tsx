import { notFound } from "next/navigation";
import { requerirSesion } from "@/lib/seguridad/requerirSesion";
import { obtenerProveedor } from "@/servicios/proveedores/obtenerProveedor";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { DetalleProveedor } from "@/componentes/proveedores/DetalleProveedor";

export const metadata = { title: "Detalle de proveedor" };

export default async function PaginaDetalleProveedor({
  params,
}: PageProps<"/proveedores/[id]">) {
  const usuario = await requerirSesion();
  const { id } = await params;
  const proveedor = await obtenerProveedor(id);

  if (!proveedor) notFound();

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo={proveedor.nombre}
        descripcion={proveedor.empresa ?? "Detalle y productos asociados."}
        acciones={
          <EnlaceBoton href="/proveedores" variante="secundario">
            Volver
          </EnlaceBoton>
        }
      />
      <DetalleProveedor
        proveedor={proveedor}
        esAdmin={usuario.rol === "ADMIN"}
      />
    </div>
  );
}
