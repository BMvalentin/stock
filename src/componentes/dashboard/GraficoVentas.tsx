import type { VentaPorDia } from "@/servicios/dashboard/obtenerVentasPorDia";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { cn } from "@/lib/utilidades/cn";

export function GraficoVentas({
  datos,
  moneda,
  locale,
}: {
  datos: VentaPorDia[];
  moneda: string;
  locale: string;
}) {
  const maximo = Math.max(...datos.map((dato) => dato.total), 1);
  const hayVentas = datos.some((dato) => dato.total > 0);

  return (
    <div className="space-y-3">
      <div className="flex h-40 items-end gap-1">
        {datos.map((dato) => {
          const altura = (dato.total / maximo) * 100;

          return (
            <div
              key={dato.fecha}
              className="flex h-full flex-1 items-end"
              title={`${dato.etiqueta}: ${formatearMoneda(dato.total, moneda, locale)}`}
            >
              <div
                className={cn(
                  "w-full rounded-t transition-colors",
                  dato.total > 0 ? "bg-zinc-800" : "bg-zinc-200",
                )}
                style={{ height: `${dato.total > 0 ? Math.max(altura, 3) : 1.5}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-1">
        {datos.map((dato, indice) => (
          <div key={dato.fecha} className="flex-1 text-center">
            <span
              className={cn(
                "text-[10px] text-zinc-400",
                indice % 2 === 1 ? "hidden sm:inline" : "inline",
              )}
            >
              {dato.etiqueta}
            </span>
          </div>
        ))}
      </div>

      {!hayVentas ? (
        <p className="text-center text-xs text-zinc-400">
          Sin ventas registradas en el período.
        </p>
      ) : null}
    </div>
  );
}
