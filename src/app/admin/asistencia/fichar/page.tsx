import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { PanelFichajeQR } from "@/componentes/empleados/PanelFichajeQR";

export const metadata = { title: "Fichar asistencia" };

export default async function PaginaFicharAsistencia() {
  await requerirAdmin();
  const configuracion = await obtenerConfiguracionGeneral();

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <EncabezadoPagina
        titulo="Mi asistencia"
        descripcion="Fichá tu entrada y salida escaneando el código QR del comercio."
      />
      <PanelFichajeQR locale={configuracion.locale} />
    </div>
  );
}
