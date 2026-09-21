import { z } from "zod";
import {
  esquemaFechaCalendario,
  esquemaHoraOpcional,
} from "@/lib/validaciones/tiempo";
import { horaAMinutos } from "@/lib/utilidades/horaAMinutos";

type DatosTramos = {
  estado: "PRESENTE" | "AUSENTE" | "JUSTIFICADO";
  horaEntrada?: string;
  horaSalida?: string;
  horaEntradaTramo2?: string;
  horaSalidaTramo2?: string;
};

const baseAsistencia = z.object({
  estado: z.enum(["PRESENTE", "AUSENTE", "JUSTIFICADO"], {
    message: "Estado inválido",
  }),
  horaEntrada: esquemaHoraOpcional,
  horaSalida: esquemaHoraOpcional,
  horaEntradaTramo2: esquemaHoraOpcional,
  horaSalidaTramo2: esquemaHoraOpcional,
  observacion: z
    .string()
    .trim()
    .max(300, "Máximo 300 caracteres")
    .optional()
    .transform((valor) => (valor ? valor : undefined)),
});

// Valida la coherencia de los tramos. Si el estado es PRESENTE se exige el
// tramo 1 completo; el tramo 2 es opcional pero, si se carga, debe estar
// completo y ser posterior al tramo 1. AUSENTE y JUSTIFICADO no requieren horas.
function validarTramos(datos: DatosTramos, ctx: z.RefinementCtx): void {
  if (datos.estado !== "PRESENTE") return;

  if (!datos.horaEntrada) {
    ctx.addIssue({
      code: "custom",
      path: ["horaEntrada"],
      message: "La hora de entrada del tramo 1 es obligatoria",
    });
  }

  if (!datos.horaSalida) {
    ctx.addIssue({
      code: "custom",
      path: ["horaSalida"],
      message: "La hora de salida del tramo 1 es obligatoria",
    });
  }

  if (
    datos.horaEntrada &&
    datos.horaSalida &&
    horaAMinutos(datos.horaSalida) <= horaAMinutos(datos.horaEntrada)
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["horaSalida"],
      message: "La salida del tramo 1 debe ser posterior a la entrada",
    });
  }

  const tieneEntrada2 = Boolean(datos.horaEntradaTramo2);
  const tieneSalida2 = Boolean(datos.horaSalidaTramo2);

  if (tieneEntrada2 !== tieneSalida2) {
    ctx.addIssue({
      code: "custom",
      path: [tieneEntrada2 ? "horaSalidaTramo2" : "horaEntradaTramo2"],
      message: "Completá la entrada y la salida del tramo 2",
    });
  }

  if (tieneEntrada2 && tieneSalida2) {
    if (
      horaAMinutos(datos.horaSalidaTramo2 as string) <=
      horaAMinutos(datos.horaEntradaTramo2 as string)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["horaSalidaTramo2"],
        message: "La salida del tramo 2 debe ser posterior a la entrada",
      });
    }

    if (
      datos.horaSalida &&
      horaAMinutos(datos.horaEntradaTramo2 as string) <=
        horaAMinutos(datos.horaSalida)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["horaEntradaTramo2"],
        message: "El tramo 2 debe comenzar después de finalizar el tramo 1",
      });
    }
  }
}

export const esquemaAsistencia = baseAsistencia
  .extend({
    empleadoId: z.string().min(1, "Empleado inválido"),
    fecha: esquemaFechaCalendario,
  })
  .superRefine(validarTramos);

export const esquemaAsistenciaEdicion = baseAsistencia.superRefine(validarTramos);
