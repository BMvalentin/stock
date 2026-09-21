import type { ReactNode } from "react";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";

// Gate centralizado del área exclusivamente administrativa. Al agrupar estas
// rutas en un route group, la autorización se aplica una sola vez en el
// servidor antes de renderizar cualquier página hija. Las páginas que además
// llaman a `requerirAdmin()` reutilizan la sesión cacheada de la request.
export default async function LayoutSoloAdmin({
  children,
}: {
  children: ReactNode;
}) {
  await requerirAdmin();

  return children;
}
