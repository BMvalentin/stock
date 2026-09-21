// Normaliza un teléfono conservando el prefijo internacional `+` y solo los
// dígitos. Quita espacios, guiones, paréntesis y puntos. Admite los formatos
// habituales de Argentina sin imponer un patrón rígido.
export function normalizarTelefono(valor: string): string {
  const recortado = valor.trim();
  const tienePrefijo = recortado.startsWith("+");
  const digitos = recortado.replace(/\D/g, "");

  return tienePrefijo ? `+${digitos}` : digitos;
}
