// Convierte una clave calendario "YYYY-MM-DD" en la etiqueta "dd/mm". No
// depende de la zona horaria del servidor.
export function etiquetaDiaMesDesdeClave(clave: string): string {
  return `${clave.slice(8, 10)}/${clave.slice(5, 7)}`;
}
