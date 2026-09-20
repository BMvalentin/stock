const formateadores = new Map<string, Intl.DateTimeFormat>();

// Formatea fecha y hora en el locale indicado.
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
    });
    formateadores.set(locale, formateador);
  }

  return formateador.format(fecha);
}
