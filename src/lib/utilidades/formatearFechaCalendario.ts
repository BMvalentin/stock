const formateadores = new Map<string, Intl.DateTimeFormat>();

// Formatea una fecha de calendario (columna `@db.Date`, guardada a medianoche
// UTC) en la zona UTC para no mostrar el día anterior en zonas negativas.
export function formatearFechaCalendario(
  valor: Date | string,
  locale = "es-AR",
): string {
  const fecha = typeof valor === "string" ? new Date(valor) : valor;
  let formateador = formateadores.get(locale);

  if (!formateador) {
    formateador = new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeZone: "UTC",
    });
    formateadores.set(locale, formateador);
  }

  return formateador.format(fecha);
}
