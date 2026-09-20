const formateadores = new Map<string, Intl.DateTimeFormat>();

// Formatea únicamente la fecha (sin hora) en el locale indicado.
export function formatearFecha(valor: Date | string, locale = "es-AR"): string {
  const fecha = typeof valor === "string" ? new Date(valor) : valor;
  let formateador = formateadores.get(locale);

  if (!formateador) {
    formateador = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    formateadores.set(locale, formateador);
  }

  return formateador.format(fecha);
}
