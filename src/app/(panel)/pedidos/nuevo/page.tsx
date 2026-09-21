import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { listarMetodosPagoActivos } from "@/servicios/metodosPago/listarMetodosPagoActivos";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";
import { FormularioPedido } from "@/componentes/pedidos/FormularioPedido";

export const metadata = { title: "Nuevo pedido" };

export default async function PaginaNuevoPedido() {
  await requerirAdmin();

  const [configuracion, metodosPago] = await Promise.all([
    obtenerConfiguracionGeneral(),
    listarMetodosPagoActivos(),
  ]);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Nuevo pedido"
        descripcion="Cargá los datos del cliente, la entrega y los productos. El sistema calcula precios, envío y total."
        acciones={
          <EnlaceBoton href="/pedidos" variante="secundario">
            Volver
          </EnlaceBoton>
        }
      />
      <FormularioPedido
        metodosPago={metodosPago}
        moneda={configuracion.moneda}
        locale={configuracion.locale}
      />
    </div>
  );
}
