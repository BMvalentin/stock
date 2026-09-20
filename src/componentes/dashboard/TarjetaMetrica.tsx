import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utilidades/cn";

export type TonoMetrica = "neutral" | "exito" | "alerta" | "peligro" | "info";

const TONOS: Record<TonoMetrica, string> = {
  neutral: "text-zinc-900",
  exito: "text-emerald-600",
  alerta: "text-amber-600",
  peligro: "text-red-600",
  info: "text-blue-600",
};

export function TarjetaMetrica({
  etiqueta,
  valor,
  icono,
  tono = "neutral",
  detalle,
  href,
}: {
  etiqueta: string;
  valor: string;
  icono?: ReactNode;
  tono?: TonoMetrica;
  detalle?: string;
  href?: string;
}) {
  const contenido = (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {etiqueta}
        </p>
        {icono ? <span className="text-zinc-400">{icono}</span> : null}
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tracking-tight",
          TONOS[tono],
        )}
      >
        {valor}
      </p>
      {detalle ? (
        <p className="mt-1 text-xs text-zinc-500">{detalle}</p>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {contenido}
      </Link>
    );
  }

  return contenido;
}
