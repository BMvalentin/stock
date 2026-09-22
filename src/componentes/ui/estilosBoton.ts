import { cn } from "@/lib/utilidades/cn";

export type VarianteBoton = "primario" | "secundario" | "fantasma" | "peligro";
export type TamanoBoton = "sm" | "md";

const VARIANTES: Record<VarianteBoton, string> = {
  primario: "bg-zinc-900 text-white hover:bg-zinc-800",
  secundario:
    "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
  fantasma: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
  peligro: "bg-red-600 text-white hover:bg-red-700",
};

const TAMANOS: Record<TamanoBoton, string> = {
  sm: "min-h-8 gap-1.5 px-3 text-xs",
  md: "min-h-9 gap-2 px-4 text-sm",
};

export function estilosBoton(
  variante: VarianteBoton = "primario",
  tamano: TamanoBoton = "md",
  className?: string,
): string {
  return cn(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 disabled:pointer-events-none disabled:opacity-60",
    VARIANTES[variante],
    TAMANOS[tamano],
    className,
  );
}
