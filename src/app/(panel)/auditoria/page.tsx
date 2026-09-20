import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { PaginaEnConstruccion } from "@/componentes/comunes/PaginaEnConstruccion";

export const metadata = { title: "Auditoría" };

export default async function PaginaAuditoria() {
  await requerirAdmin();

  return (
    <PaginaEnConstruccion
      titulo="Auditoría"
      descripcion="Registro de solo lectura de las operaciones administrativas importantes."
    />
  );
}
