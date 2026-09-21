// Convierte minutos desde medianoche en una hora "HH:mm".
export function minutosAHora(minutos: number): string {
  const normalizados = ((minutos % 1440) + 1440) % 1440;
  const horas = Math.floor(normalizados / 60);
  const resto = normalizados % 60;
  return `${String(horas).padStart(2, "0")}:${String(resto).padStart(2, "0")}`;
}
