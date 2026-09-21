import Link from "next/link";
import { cn } from "@/lib/utilidades/cn";

export type SeccionEmpleado =
  | "detalle"
  | "asistencia"
  | "produccion"
  | "liquidacion";

const ITEMS: { clave: SeccionEmpleado; etiqueta: string; sufijo: string }[] = [
  { clave: "detalle", etiqueta: "Remuneración", sufijo: "" },
  { clave: "asistencia", etiqueta: "Asistencia", sufijo: "/asistencia" },
  { clave: "produccion", etiqueta: "Producción", sufijo: "/produccion" },
  { clave: "liquidacion", etiqueta: "Liquidaciones", sufijo: "/liquidacion" },
];

// Navegación interna del empleado. Solo ADMIN accede a estas rutas.
export function EnlacesEmpleado({
  userId,
  actual,
}: {
  userId: string;
  actual: SeccionEmpleado;
}) {
  return (
    <nav className="flex flex-wrap gap-1 border-b border-zinc-200">
      {ITEMS.map((item) => (
        <Link
          key={item.clave}
          href={`/empleados/${userId}${item.sufijo}`}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            item.clave === actual
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-900",
          )}
        >
          {item.etiqueta}
        </Link>
      ))}
    </nav>
  );
}
