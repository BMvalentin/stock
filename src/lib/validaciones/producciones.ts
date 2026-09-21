import { z } from "zod";
import { esquemaFechaCalendario } from "@/lib/validaciones/tiempo";

// Producción registrada. La cantidad es entera y positiva: no se admiten 0 ni
// decimales. El precio no viaja desde el frontend.
export const esquemaProduccion = z.object({
  empleadoId: z.string().min(1, "Empleado inválido"),
  productoId: z.string().min(1, "Seleccioná un producto"),
  fecha: esquemaFechaCalendario,
  cantidad: z.coerce
    .number()
    .int("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser mayor a 0"),
});
