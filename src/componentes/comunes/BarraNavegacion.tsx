import Link from "next/link";
import { ITEMS_NAVEGACION } from "@/constantes/navegacion";
import { cerrarSesion } from "@/acciones/autenticacion/cerrarSesion";
import type { Rol } from "@/generated/prisma/enums";

export function BarraNavegacion({
  rol,
  nombre,
}: {
  rol: Rol;
  nombre: string | null;
}) {
  const items = ITEMS_NAVEGACION.filter(
    (item) => !item.soloAdmin || rol === "ADMIN",
  );

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-5 py-4">
        <p className="text-sm font-semibold text-zinc-900">Gestión de Stock</p>
        <p className="text-xs text-zinc-500">Panel administrativo</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <Link
            key={item.ruta}
            href={item.ruta}
            className="block rounded-md px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            {item.etiqueta}
          </Link>
        ))}
      </nav>

      <div className="space-y-2 border-t border-zinc-200 p-4">
        <div>
          <p className="truncate text-sm font-medium text-zinc-900">
            {nombre ?? "Usuario"}
          </p>
          <p className="text-xs uppercase tracking-wide text-zinc-500">{rol}</p>
        </div>
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
