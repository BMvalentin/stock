import type { ReactNode } from "react";
import { PackageOpen } from "lucide-react";

export function EstadoVacio({
  titulo,
  descripcion,
  accion,
  icono,
}: {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  icono?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
        {icono ?? <PackageOpen className="h-5 w-5" strokeWidth={1.75} />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-900">{titulo}</p>
        {descripcion ? (
          <p className="mx-auto max-w-sm text-sm text-zinc-500">
            {descripcion}
          </p>
        ) : null}
      </div>
      {accion ? <div className="mt-1">{accion}</div> : null}
    </div>
  );
}
