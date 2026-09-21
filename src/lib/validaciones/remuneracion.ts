import { z } from "zod";
import { esquemaHora, esquemaHoraOpcional } from "@/lib/validaciones/tiempo";
import {
  esquemaHorasJornada,
  esquemaMontoNoNegativo,
} from "@/lib/validaciones/montos";
import { horaAMinutos } from "@/lib/utilidades/horaAMinutos";

// Configuración de remuneración de un empleado. La jornada solo se exige para
// la modalidad POR_HORA; en POR_PRODUCCION se conserva pero no se usa. El tramo
// 2 es opcional: sin él la jornada es continua, con él es partida.
export const esquemaRemuneracion = z
  .object({
    empleadoId: z.string().min(1, "Empleado inválido"),
    tipoRemuneracion: z.enum(["POR_HORA", "POR_PRODUCCION"], {
      message: "Modalidad de remuneración inválida",
    }),
    horasJornada: esquemaHorasJornada,
    pagoJornada: esquemaMontoNoNegativo,
    horaEntradaEsperada: esquemaHora,
    horaSalidaEsperada: esquemaHora,
    horaEntradaTramo2Esperada: esquemaHoraOpcional,
    horaSalidaTramo2Esperada: esquemaHoraOpcional,
  })
  .superRefine((datos, ctx) => {
    if (datos.tipoRemuneracion !== "POR_HORA") return;

    if (Number(datos.pagoJornada) <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["pagoJornada"],
        message: "El pago de jornada completa debe ser mayor a 0",
      });
    }

    if (
      horaAMinutos(datos.horaSalidaEsperada) <=
      horaAMinutos(datos.horaEntradaEsperada)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["horaSalidaEsperada"],
        message: "La hora de salida debe ser posterior a la de entrada",
      });
    }

    const tieneEntrada2 = Boolean(datos.horaEntradaTramo2Esperada);
    const tieneSalida2 = Boolean(datos.horaSalidaTramo2Esperada);

    if (tieneEntrada2 !== tieneSalida2) {
      ctx.addIssue({
        code: "custom",
        path: [
          tieneEntrada2
            ? "horaSalidaTramo2Esperada"
            : "horaEntradaTramo2Esperada",
        ],
        message: "Completá la entrada y la salida del tramo 2",
      });
    }

    if (tieneEntrada2 && tieneSalida2) {
      if (
        horaAMinutos(datos.horaSalidaTramo2Esperada as string) <=
        horaAMinutos(datos.horaEntradaTramo2Esperada as string)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["horaSalidaTramo2Esperada"],
          message: "La salida del tramo 2 debe ser posterior a la entrada",
        });
      }

      if (
        horaAMinutos(datos.horaEntradaTramo2Esperada as string) <=
        horaAMinutos(datos.horaSalidaEsperada)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["horaEntradaTramo2Esperada"],
          message: "El tramo 2 debe comenzar después de finalizar el tramo 1",
        });
      }
    }
  });
