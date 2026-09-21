import { horaAMinutos } from "@/lib/utilidades/horaAMinutos";
import type { EstadoAsistencia } from "@/generated/prisma/enums";
import type { TramosAsistencia } from "@/tipos/asistencia";

export type MinutosJornada = {
  minutosTrabajados: number;
  minutosRetraso: number;
  minutosRetrasoTramo1: number;
  minutosRetrasoTramo2: number;
  tramo1Completo: boolean;
  tramo2Completo: boolean;
  completa: boolean;
};

// Calcula los minutos trabajados y de retraso de una jornada, por tramo y en
// total. Solo se computa un tramo cuando está completo (entrada y salida): así
// una jornada incompleta no suma horas ni descuenta retraso. El retraso se mide
// contra la entrada esperada de cada tramo. No se redondea.
export function calcularMinutosJornada(datos: {
  estado: EstadoAsistencia;
  tramos: TramosAsistencia;
  horaEntradaEsperada: string;
  horaSalidaEsperada: string;
  horaEntradaTramo2Esperada: string | null;
  horaSalidaTramo2Esperada: string | null;
}): MinutosJornada {
  const vacio: MinutosJornada = {
    minutosTrabajados: 0,
    minutosRetraso: 0,
    minutosRetrasoTramo1: 0,
    minutosRetrasoTramo2: 0,
    tramo1Completo: false,
    tramo2Completo: false,
    completa: false,
  };

  if (datos.estado !== "PRESENTE") return vacio;

  const { tramos } = datos;

  const tramo1Completo = Boolean(tramos.horaEntrada && tramos.horaSalida);
  const tramo2Completo = Boolean(
    tramos.horaEntradaTramo2 && tramos.horaSalidaTramo2,
  );

  const minutosTramo1 = tramo1Completo
    ? Math.max(
        0,
        horaAMinutos(tramos.horaSalida as string) -
          horaAMinutos(tramos.horaEntrada as string),
      )
    : 0;

  const minutosTramo2 = tramo2Completo
    ? Math.max(
        0,
        horaAMinutos(tramos.horaSalidaTramo2 as string) -
          horaAMinutos(tramos.horaEntradaTramo2 as string),
      )
    : 0;

  const minutosRetrasoTramo1 = tramo1Completo
    ? Math.max(
        0,
        horaAMinutos(tramos.horaEntrada as string) -
          horaAMinutos(datos.horaEntradaEsperada),
      )
    : 0;

  const minutosRetrasoTramo2 =
    tramo2Completo && datos.horaEntradaTramo2Esperada
      ? Math.max(
          0,
          horaAMinutos(tramos.horaEntradaTramo2 as string) -
            horaAMinutos(datos.horaEntradaTramo2Esperada),
        )
      : 0;

  const esperaSegundoTramo = Boolean(
    datos.horaEntradaTramo2Esperada && datos.horaSalidaTramo2Esperada,
  );

  return {
    minutosTrabajados: minutosTramo1 + minutosTramo2,
    minutosRetraso: minutosRetrasoTramo1 + minutosRetrasoTramo2,
    minutosRetrasoTramo1,
    minutosRetrasoTramo2,
    tramo1Completo,
    tramo2Completo,
    completa: esperaSegundoTramo
      ? tramo1Completo && tramo2Completo
      : tramo1Completo,
  };
}
