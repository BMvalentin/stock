import { horaAMinutos } from "@/lib/utilidades/horaAMinutos";

export type EstadoPuntualidad =
  | "SIN_FICHAJE"
  | "A_HORARIO"
  | "TARDE"
  | "ANTICIPADO";

export type PuntualidadEntrada = {
  estado: EstadoPuntualidad;
  // Diferencia en minutos: positivo = tarde, negativo = anticipado.
  diferenciaMinutos: number;
};

// Compara la hora esperada de entrada con la hora real del fichaje. Ambas son
// texto "HH:mm" ya generado por el servidor en la zona del comercio, por lo que
// la comparación no depende de la zona horaria del servidor.
export function calcularPuntualidadEntrada(datos: {
  horaEsperada: string;
  horaFichaje: string | null;
}): PuntualidadEntrada {
  if (!datos.horaFichaje) {
    return { estado: "SIN_FICHAJE", diferenciaMinutos: 0 };
  }

  const diferencia =
    horaAMinutos(datos.horaFichaje) - horaAMinutos(datos.horaEsperada);

  if (diferencia > 0) return { estado: "TARDE", diferenciaMinutos: diferencia };
  if (diferencia < 0)
    return { estado: "ANTICIPADO", diferenciaMinutos: diferencia };

  return { estado: "A_HORARIO", diferenciaMinutos: 0 };
}
