import { prisma } from "@/lib/prisma/cliente";
import { fechaHoyCalendario } from "@/lib/utilidades/fechaHoyCalendario";
import { obtenerAsistenciaDia } from "@/servicios/asistencias/obtenerAsistenciaDia";
import {
  listarUltimosFichajes,
  type FichajeResumen,
} from "@/servicios/asistencias/listarUltimosFichajes";
import type { Rol } from "@/generated/prisma/enums";

export type HorarioEmpleado = {
  horaEntradaEsperada: string;
  horaSalidaEsperada: string;
  horaEntradaTramo2Esperada: string | null;
  horaSalidaTramo2Esperada: string | null;
};

export type ResumenEmpleado = {
  nombre: string | null;
  email: string;
  rol: Rol;
  horario: HorarioEmpleado | null;
  fichajeHoy: {
    horaEntrada: string | null;
    horaSalida: string | null;
    horaEntradaTramo2: string | null;
    horaSalidaTramo2: string | null;
    minutosTrabajados: number | null;
    minutosRetraso: number | null;
  } | null;
  ultimosFichajes: FichajeResumen[];
};

const seleccionEmpleado = {
  id: true,
  horaEntradaEsperada: true,
  horaSalidaEsperada: true,
  horaEntradaTramo2Esperada: true,
  horaSalidaTramo2Esperada: true,
} as const;

// Resumen personal del empleado para su dashboard. Consulta solo lo que el
// empleado necesita: identidad, horario de hoy, fichaje actual y últimos
// fichajes. Nunca expone datos salariales ni de otros empleados. Es de solo
// lectura: no crea perfiles ni modifica nada.
export async function obtenerResumenEmpleado(
  usuarioId: string,
): Promise<ResumenEmpleado | null> {
  const usuario = await prisma.user.findUnique({
    where: { id: usuarioId },
    select: {
      name: true,
      email: true,
      rol: true,
      empleado: { select: seleccionEmpleado },
    },
  });

  if (!usuario) return null;

  const empleado = usuario.empleado;

  const [fichajeHoy, ultimosFichajes] = empleado
    ? await Promise.all([
        obtenerAsistenciaDia(empleado.id, fechaHoyCalendario()),
        listarUltimosFichajes(empleado.id, 5),
      ])
    : [null, []];

  return {
    nombre: usuario.name,
    email: usuario.email,
    rol: usuario.rol,
    horario: empleado
      ? {
          horaEntradaEsperada: empleado.horaEntradaEsperada,
          horaSalidaEsperada: empleado.horaSalidaEsperada,
          horaEntradaTramo2Esperada: empleado.horaEntradaTramo2Esperada,
          horaSalidaTramo2Esperada: empleado.horaSalidaTramo2Esperada,
        }
      : null,
    fichajeHoy: fichajeHoy
      ? {
          horaEntrada: fichajeHoy.horaEntrada,
          horaSalida: fichajeHoy.horaSalida,
          horaEntradaTramo2: fichajeHoy.horaEntradaTramo2,
          horaSalidaTramo2: fichajeHoy.horaSalidaTramo2,
          minutosTrabajados: fichajeHoy.minutosTrabajados,
          minutosRetraso: fichajeHoy.minutosRetraso,
        }
      : null,
    ultimosFichajes,
  };
}
