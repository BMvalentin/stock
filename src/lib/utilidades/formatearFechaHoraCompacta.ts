import { ZONA_HORARIA } from "@/constantes/zonaHoraria";

const formateadoresFecha = new Map<string, Intl.DateTimeFormat>();
const formateadoresHora = new Map<string, Intl.DateTimeFormat>();

// Formato compacto para encabezados en mobile: "22/9/26 · 08:49".
// Usa siempre la zona horaria del comercio y hora de 24 horas.
export function formatearFechaHoraCompacta(
  valor: Date | string,
  locale = "es-AR",
): string {
  const fecha = typeof valor === "string" ? new Date(valor) : valor;

  let formateadorFecha = formateadoresFecha.get(locale);
  if (!formateadorFecha) {
    formateadorFecha = new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeZone: ZONA_HORARIA,
    });
    formateadoresFecha.set(locale, formateadorFecha);
  }

  let formateadorHora = formateadoresHora.get(locale);
  if (!formateadorHora) {
    formateadorHora = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: ZONA_HORARIA,
    });
    formateadoresHora.set(locale, formateadorHora);
  }

  return `${formateadorFecha.format(fecha)} · ${formateadorHora.format(fecha)}`;
}
