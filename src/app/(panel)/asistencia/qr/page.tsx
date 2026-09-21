import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { PanelSeccion } from "@/componentes/ui/PanelSeccion";
import { GeneradorQRFichaje } from "@/componentes/empleados/GeneradorQRFichaje";

export const metadata = { title: "Fichaje QR" };

export default async function PaginaQRFichaje() {
  await requerirAdmin();
  const configuracion = await obtenerConfiguracionGeneral();

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <EncabezadoPagina
        titulo="Fichaje de asistencia"
        descripcion="Dejá esta pantalla abierta en el comercio. El QR se renueva automáticamente."
      />
      <PanelSeccion titulo="Código QR">
        <GeneradorQRFichaje locale={configuracion.locale} />
      </PanelSeccion>
    </div>
  );
}
