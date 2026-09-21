import { prisma } from "@/lib/prisma/cliente";
import type { Prisma } from "@/generated/prisma/client";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { registrarAuditoria } from "@/servicios/auditoria/registrarAuditoria";
import { ACCIONES_AUDITORIA } from "@/constantes/accionesAuditoria";
import { calcularMinutosJornada } from "@/servicios/asistencias/calcularMinutosJornada";
import { calcularEstadoJornada } from "@/servicios/asistencias/calcularEstadoJornada";
import { determinarProximoFichaje } from "@/servicios/asistencias/determinarProximoFichaje";
import { validarTokenFichajeQR } from "@/servicios/asistencias/validarTokenFichajeQR";
import { claveFechaEnZona } from "@/lib/utilidades/claveFechaEnZona";
import { horaEnZona } from "@/lib/utilidades/horaEnZona";
import { ZONA_HORARIA } from "@/constantes/zonaHoraria";
import { VENTANA_IDEMPOTENCIA_FICHAJE_MS } from "@/constantes/fichaje";
import type {
  AccionFichaje,
  EstadoJornada,
  TramosAsistencia,
} from "@/tipos/asistencia";

export type ResumenFichaje = {
  horaEntrada: string | null;
  horaSalida: string | null;
  horaEntradaTramo2: string | null;
  horaSalidaTramo2: string | null;
  minutosTrabajados: number;
  minutosRetraso: number;
};

export type ResultadoFichajeQR = {
  duplicado: boolean;
  accion: AccionFichaje | null;
  hora: string | null;
  fecha: string;
  estadoJornada: EstadoJornada;
  resumen: ResumenFichaje;
};

type EmpleadoFichaje = {
  id: string;
  horaEntradaEsperada: string;
  horaSalidaEsperada: string;
  horaEntradaTramo2Esperada: string | null;
  horaSalidaTramo2Esperada: string | null;
};

const seleccionFila = {
  id: true,
  estado: true,
  origen: true,
  ultimoFichajeEn: true,
  horaEntrada: true,
  horaSalida: true,
  horaEntradaTramo2: true,
  horaSalidaTramo2: true,
} as const;

type FilaAsistencia = Prisma.EmpleadoAsistenciaGetPayload<{
  select: typeof seleccionFila;
}>;

// Registra el fichaje automático por QR. La identidad del empleado surge de la
// sesión autenticada (nunca del cliente); el token solo habilita el fichaje. La
// hora y la fecha las fija el servidor con la zona del comercio. Determina la
// acción por secuencia (entrada/salida de cada tramo), evita dobles escaneos y
// rechaza el quinto fichaje. Todo dentro de una transacción.
export async function registrarFichajeQR(
  token: string,
  usuarioId: string,
): Promise<ResultadoFichajeQR> {
  await validarTokenFichajeQR(token);

  const usuario = await prisma.user.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      activo: true,
      empleado: {
        select: {
          id: true,
          horaEntradaEsperada: true,
          horaSalidaEsperada: true,
          horaEntradaTramo2Esperada: true,
          horaSalidaTramo2Esperada: true,
        },
      },
    },
  });

  if (!usuario || !usuario.activo) {
    throw new ErrorNegocio("La cuenta no está activa.");
  }

  if (!usuario.empleado) {
    throw new ErrorNegocio(
      "No se encontró un empleado asociado a esta cuenta.",
    );
  }

  const empleado = usuario.empleado;
  const esperaSegundoTramo = Boolean(
    empleado.horaEntradaTramo2Esperada && empleado.horaSalidaTramo2Esperada,
  );

  const ahora = new Date();
  const claveFecha = claveFechaEnZona(ahora, ZONA_HORARIA);
  const fecha = new Date(`${claveFecha}T00:00:00.000Z`);
  const hora = horaEnZona(ahora, ZONA_HORARIA);

  return ejecutarConReintento(() =>
    prisma.$transaction(async (tx) => {
      let fila = await tx.empleadoAsistencia.findUnique({
        where: { empleadoId_fecha: { empleadoId: empleado.id, fecha } },
        select: seleccionFila,
      });

      if (!fila) {
        fila = await tx.empleadoAsistencia.create({
          data: {
            empleadoId: empleado.id,
            fecha,
            estado: "PRESENTE",
            origen: "QR",
          },
          select: seleccionFila,
        });
      }

      if (
        fila.ultimoFichajeEn &&
        ahora.getTime() - fila.ultimoFichajeEn.getTime() <
          VENTANA_IDEMPOTENCIA_FICHAJE_MS
      ) {
        return construirResultado(fila, empleado, null, true, claveFecha);
      }

      const accion = determinarProximoFichaje(
        tramosDe(fila),
        esperaSegundoTramo,
      );

      if (accion === "COMPLETA") {
        throw new ErrorNegocio("No hay más fichajes pendientes para hoy.");
      }

      const where: Prisma.EmpleadoAsistenciaWhereInput = { id: fila.id };
      const data: Prisma.EmpleadoAsistenciaUpdateManyMutationInput = {
        estado: "PRESENTE",
        origen: "QR",
        ultimoFichajeEn: ahora,
      };

      switch (accion) {
        case "ENTRADA_TRAMO_1":
          data.horaEntrada = hora;
          where.horaEntrada = null;
          break;
        case "SALIDA_TRAMO_1":
          data.horaSalida = hora;
          where.horaSalida = null;
          break;
        case "ENTRADA_TRAMO_2":
          data.horaEntradaTramo2 = hora;
          where.horaEntradaTramo2 = null;
          break;
        case "SALIDA_TRAMO_2":
          data.horaSalidaTramo2 = hora;
          where.horaSalidaTramo2 = null;
          break;
      }

      const actualizado = await tx.empleadoAsistencia.updateMany({
        where,
        data,
      });

      if (actualizado.count === 0) {
        throw new ErrorNegocio(
          "El fichaje ya se registró. Esperá unos segundos e intentá de nuevo.",
        );
      }

      const filaActualizada = await tx.empleadoAsistencia.findUniqueOrThrow({
        where: { id: fila.id },
        select: seleccionFila,
      });

      const minutos = calcularMinutosJornada({
        estado: filaActualizada.estado,
        tramos: tramosDe(filaActualizada),
        horaEntradaEsperada: empleado.horaEntradaEsperada,
        horaSalidaEsperada: empleado.horaSalidaEsperada,
        horaEntradaTramo2Esperada: empleado.horaEntradaTramo2Esperada,
        horaSalidaTramo2Esperada: empleado.horaSalidaTramo2Esperada,
      });

      await tx.empleadoAsistencia.update({
        where: { id: filaActualizada.id },
        data: {
          minutosTrabajados: minutos.minutosTrabajados,
          minutosRetraso: minutos.minutosRetraso,
          minutosRetrasoTramo1: minutos.minutosRetrasoTramo1,
          minutosRetrasoTramo2: minutos.minutosRetrasoTramo2,
        },
      });

      await registrarAuditoria(
        {
          usuarioId,
          accion: ACCIONES_AUDITORIA.ASISTENCIA_FICHAJE_QR,
          entidad: "EmpleadoAsistencia",
          entidadId: filaActualizada.id,
          datos: {
            empleadoId: empleado.id,
            fecha: claveFecha,
            accion,
            hora,
            origen: "QR",
          },
        },
        tx,
      );

      return construirResultado(
        filaActualizada,
        empleado,
        accion,
        false,
        claveFecha,
      );
    }),
  );
}

function tramosDe(fila: FilaAsistencia): TramosAsistencia {
  return {
    horaEntrada: fila.horaEntrada,
    horaSalida: fila.horaSalida,
    horaEntradaTramo2: fila.horaEntradaTramo2,
    horaSalidaTramo2: fila.horaSalidaTramo2,
  };
}

function construirResultado(
  fila: FilaAsistencia,
  empleado: EmpleadoFichaje,
  accion: AccionFichaje | null,
  duplicado: boolean,
  claveFecha: string,
): ResultadoFichajeQR {
  const tramos = tramosDe(fila);
  const esperaSegundoTramo = Boolean(
    empleado.horaEntradaTramo2Esperada && empleado.horaSalidaTramo2Esperada,
  );

  const minutos = calcularMinutosJornada({
    estado: fila.estado,
    tramos,
    horaEntradaEsperada: empleado.horaEntradaEsperada,
    horaSalidaEsperada: empleado.horaSalidaEsperada,
    horaEntradaTramo2Esperada: empleado.horaEntradaTramo2Esperada,
    horaSalidaTramo2Esperada: empleado.horaSalidaTramo2Esperada,
  });

  const estadoJornada = calcularEstadoJornada({
    estado: fila.estado,
    tramos,
    esperaSegundoTramo,
  });

  return {
    duplicado,
    accion,
    hora: duplicado ? null : horaDeAccion(tramos, accion),
    fecha: claveFecha,
    estadoJornada,
    resumen: {
      ...tramos,
      minutosTrabajados: minutos.minutosTrabajados,
      minutosRetraso: minutos.minutosRetraso,
    },
  };
}

function horaDeAccion(
  tramos: TramosAsistencia,
  accion: AccionFichaje | null,
): string | null {
  switch (accion) {
    case "ENTRADA_TRAMO_1":
      return tramos.horaEntrada;
    case "SALIDA_TRAMO_1":
      return tramos.horaSalida;
    case "ENTRADA_TRAMO_2":
      return tramos.horaEntradaTramo2;
    case "SALIDA_TRAMO_2":
      return tramos.horaSalidaTramo2;
    default:
      return null;
  }
}

// Reintenta la transacción si dos escaneos simultáneos chocan con la clave
// única (empleadoId, fecha). Un máximo acotado para no quedar en bucle.
async function ejecutarConReintento<T>(
  operacion: () => Promise<T>,
  intentos = 3,
): Promise<T> {
  try {
    return await operacion();
  } catch (error) {
    const codigo = (error as { code?: string } | null)?.code;
    const esConflictoUnico =
      codigo === "P2002" || codigo === "P2003" || codigo === "P2034";

    if (esConflictoUnico && intentos > 1) {
      return ejecutarConReintento(operacion, intentos - 1);
    }

    throw error;
  }
}
