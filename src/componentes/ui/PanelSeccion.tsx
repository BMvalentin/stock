import type { ReactNode } from "react";
import Link from "next/link";

export function PanelSeccion({
  titulo,
  descripcion,
  enlace,
  textoEnlace,
  children,
}: {
  titulo: string;
  descripcion?: string;
  enlace?: string;
  textoEnlace?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900">{titulo}</h2>
          {descripcion ? (
            <p className="truncate text-xs text-zinc-500">{descripcion}</p>
          ) : null}
        </div>
        {enlace ? (
          <Link
            href={enlace}
            className="shrink-0 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            {textoEnlace ?? "Ver todo"}
          </Link>
        ) : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
