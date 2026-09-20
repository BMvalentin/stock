"use client";

import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { cerrarSesion } from "@/acciones/autenticacion/cerrarSesion";
import { ETIQUETAS_ROL } from "@/constantes/roles";
import type { Rol } from "@/generated/prisma/enums";

export function MenuUsuario({
  nombre,
  email,
  rol,
}: {
  nombre: string | null;
  email: string;
  rol: Rol;
}) {
  const [abierto, setAbierto] = useState(false);
  const inicial = (nombre ?? email).charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-zinc-100"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700">
          {inicial}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-[10rem] truncate text-sm font-medium text-zinc-900">
            {nombre ?? email}
          </span>
          <span className="block text-xs text-zinc-500">
            {ETIQUETAS_ROL[rol]}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-zinc-400" />
      </button>

      {abierto ? (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setAbierto(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-lg"
          >
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium text-zinc-900">
                {nombre ?? "Usuario"}
              </p>
              <p className="truncate text-xs text-zinc-500">{email}</p>
            </div>
            <div className="my-1 h-px bg-zinc-100" />
            <form action={cerrarSesion}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Cerrar sesión
              </button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}
