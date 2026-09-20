import { Search } from "lucide-react";
import { cn } from "@/lib/utilidades/cn";

export function CampoBusqueda({
  valorInicial,
  placeholder = "Buscar…",
  nombre = "q",
  className,
}: {
  valorInicial?: string;
  placeholder?: string;
  nombre?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        name={nombre}
        defaultValue={valorInicial ?? ""}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
      />
    </div>
  );
}
