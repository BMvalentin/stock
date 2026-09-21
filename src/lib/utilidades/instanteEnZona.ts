import { ZONA_HORARIA } from "@/constantes/zonaHoraria";

// Convierte una fecha calendario ("YYYY-MM-DD") y una hora ("HH:mm:ss.SSS") de
// la zona indicada al instante UTC correspondiente. El desfase se obtiene con
// `Intl` para respetar la zona real (no asume un offset fijo).
export function instanteEnZona(
  claveFecha: string,
  hora: string,
  zona: string = ZONA_HORARIA,
): Date {
  const [anio, mes, dia] = claveFecha.split("-").map(Number);
  const [horas, minutos, segundos = 0, milisegundos = 0] = hora
    .split(/[:.]/)
    .map(Number);

  const objetivoUtc = Date.UTC(
    anio,
    mes - 1,
    dia,
    horas,
    minutos,
    segundos,
    milisegundos,
  );

  let instante = new Date(objetivoUtc);

  // Dos iteraciones alcanzan para zonas con horario de verano: la primera usa
  // el desfase de la conjetura y la segunda lo corrige.
  for (let intento = 0; intento < 2; intento += 1) {
    const desfase = desfaseZonaMs(instante, zona);
    const candidato = new Date(objetivoUtc - desfase);
    if (candidato.getTime() === instante.getTime()) break;
    instante = candidato;
  }

  return instante;
}

function desfaseZonaMs(fecha: Date, zona: string): number {
  const base = Math.floor(fecha.getTime() / 1000) * 1000;
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(base));

  const valor = (tipo: Intl.DateTimeFormatPartTypes): number =>
    Number(partes.find((parte) => parte.type === tipo)?.value ?? 0);

  const comoUtc = Date.UTC(
    valor("year"),
    valor("month") - 1,
    valor("day"),
    valor("hour"),
    valor("minute"),
    valor("second"),
  );

  return comoUtc - base;
}
