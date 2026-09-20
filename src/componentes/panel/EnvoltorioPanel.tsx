"use client";

import { useState, type ReactNode } from "react";
import { BarraLateral } from "@/componentes/panel/BarraLateral";
import { EncabezadoPanel } from "@/componentes/panel/EncabezadoPanel";
import type { Rol } from "@/generated/prisma/enums";

export function EnvoltorioPanel({
  children,
  rol,
  nombre,
  email,
}: {
  children: ReactNode;
  rol: Rol;
  nombre: string | null;
  email: string;
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 lg:block">
        <BarraLateral rol={rol} />
      </aside>

      {menuAbierto ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-zinc-900/40"
            onClick={() => setMenuAbierto(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-zinc-200 shadow-xl">
            <BarraLateral rol={rol} alNavegar={() => setMenuAbierto(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <EncabezadoPanel
          nombre={nombre}
          email={email}
          rol={rol}
          alAbrirMenu={() => setMenuAbierto(true)}
        />
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
