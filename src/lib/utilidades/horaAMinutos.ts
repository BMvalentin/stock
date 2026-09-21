// Convierte una hora "HH:mm" en minutos desde medianoche.
export function horaAMinutos(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}
