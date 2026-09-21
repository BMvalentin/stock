// Suma (o resta) días a una fecha calendario "YYYY-MM-DD" y devuelve la nueva
// clave. Opera en UTC para no depender de la zona horaria del servidor.
export function sumarDiasCalendario(clave: string, dias: number): string {
  const [anio, mes, dia] = clave.split("-").map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia + dias))
    .toISOString()
    .slice(0, 10);
}
