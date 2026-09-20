import type { ReactNode } from "react";
import { cn } from "@/lib/utilidades/cn";

export type ColumnaTabla = {
  encabezado: string;
  alineacion?: "izq" | "centro" | "der";
  className?: string;
};

export type FilaTabla = {
  id: string;
  celdas: ReactNode[];
  className?: string;
};

const ALINEACION = {
  izq: "text-left",
  centro: "text-center",
  der: "text-right",
} as const;

export function TablaDatos({
  columnas,
  filas,
}: {
  columnas: ColumnaTabla[];
  filas: FilaTabla[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/60">
            {columnas.map((columna, indice) => (
              <th
                key={indice}
                scope="col"
                className={cn(
                  "px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500",
                  ALINEACION[columna.alineacion ?? "izq"],
                  columna.className,
                )}
              >
                {columna.encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr
              key={fila.id}
              className={cn(
                "border-b border-zinc-100 transition-colors last:border-0 hover:bg-zinc-50/60",
                fila.className,
              )}
            >
              {fila.celdas.map((celda, indice) => (
                <td
                  key={indice}
                  className={cn(
                    "px-4 py-3 align-middle text-zinc-700",
                    ALINEACION[columnas[indice]?.alineacion ?? "izq"],
                  )}
                >
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
