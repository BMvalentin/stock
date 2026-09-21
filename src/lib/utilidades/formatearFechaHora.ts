import { ZONA_HORARIA } from "@/constantes/zonaHoraria";

const formateadores = new Map<string, Intl.DateTimeFormat>();

// Formatea fecha y hora en el locale indicado, siempre en la zona horaria del
// comercio. No depende de la zona del servidor (Vercel corre en UTC).
export function formatearFechaHora(
  valor: Date | string,
  locale = "es-AR",
): string {
  const fecha = typeof valor === "string" ? new Date(valor) : valor;
  let formateador = formateadores.get(locale);

  if (!formateador) {
    formateador = new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: ZONA_HORARIA,
    });
    formateadores.set(locale, formateador);
  }

  return formateador.format(fecha);
}
