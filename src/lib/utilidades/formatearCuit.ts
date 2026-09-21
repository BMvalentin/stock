// Da formato visual a un CUIT/CUIL de 11 dígitos: XX-XXXXXXXX-X.
// Si el valor no tiene 11 dígitos lo devuelve sin modificar.
export function formatearCuit(valor: string | null): string {
  if (!valor) return "";

  const digitos = valor.replace(/\D/g, "");

  if (digitos.length !== 11) return valor;

  return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
}
