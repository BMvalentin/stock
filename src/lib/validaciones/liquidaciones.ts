import { z } from "zod";
import { esquemaFechaCalendario } from "@/lib/validaciones/tiempo";
import { parsearFechaCalendario } from "@/lib/utilidades/parsearFechaCalendario";

// Período de liquidación. El límite superior no puede ser anterior al inferior.
export const esquemaPeriodoLiquidacion = z
  .object({
    empleadoId: z.string().min(1, "Empleado inválido"),
    desde: esquemaFechaCalendario,
    hasta: esquemaFechaCalendario,
  })
  .superRefine((datos, ctx) => {
    const desde = parsearFechaCalendario(datos.desde);
    const hasta = parsearFechaCalendario(datos.hasta);

    if (desde && hasta && hasta < desde) {
      ctx.addIssue({
        code: "custom",
        path: ["hasta"],
        message: "La fecha de fin no puede ser anterior a la de inicio",
      });
    }
  });
