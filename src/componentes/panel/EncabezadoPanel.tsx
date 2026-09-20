import { Menu } from "lucide-react";
import { MigasDePan } from "@/componentes/panel/MigasDePan";
import { MenuUsuario } from "@/componentes/panel/MenuUsuario";
import type { Rol } from "@/generated/prisma/enums";

export function EncabezadoPanel({
  nombre,
  email,
  rol,
  alAbrirMenu,
}: {
  nombre: string | null;
  email: string;
  rol: Rol;
  alAbrirMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={alAbrirMenu}
        aria-label="Abrir menú"
        className="rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <MigasDePan />

      <div className="ml-auto">
        <MenuUsuario nombre={nombre} email={email} rol={rol} />
      </div>
    </header>
  );
}
