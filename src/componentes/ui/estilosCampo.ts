import { cn } from "@/lib/utilidades/cn";

// Estilos base compartidos por los campos de formulario.
export function estilosCampo(error?: string, className?: string): string {
  return cn(
    "w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500",
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
      : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10",
    className,
  );
}
