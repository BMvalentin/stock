import type { ReactNode } from "react";

export function EncabezadoPagina({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          {titulo}
        </h1>
        {descripcion ? (
          <p className="max-w-2xl text-sm text-zinc-600">{descripcion}</p>
        ) : null}
      </div>
      {acciones ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {acciones}
        </div>
      ) : null}
    </header>
  );
}
