import type { ReactNode } from "react";

export function SeccionFormulario({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <header className="border-b border-zinc-100 px-5 py-3">
        <h2 className="text-sm font-semibold text-zinc-900">{titulo}</h2>
        {descripcion ? (
          <p className="text-xs text-zinc-500">{descripcion}</p>
        ) : null}
      </header>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}
