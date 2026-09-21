// Devuelve la hora "HH:mm" de un instante en la zona indicada. Se usa para
// registrar la hora del fichaje con la zona del comercio, sin depender de la
// zona del servidor ni de la hora enviada por el navegador.
export function horaEnZona(fecha: Date, zona: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zona,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(fecha);
}
