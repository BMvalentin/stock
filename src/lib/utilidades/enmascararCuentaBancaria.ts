// Enmascara un dato bancario dejando visibles solo los últimos 4 caracteres.
// Se usa en listados, tarjetas resumidas y metadata de auditoría para no
// exponer CBU/CVU completos donde no es necesario.
export function enmascararCuentaBancaria(valor: string | null): string {
  if (!valor) return "";

  const limpio = valor.trim();

  if (limpio.length <= 4) return limpio;

  return `${"•".repeat(limpio.length - 4)}${limpio.slice(-4)}`;
}
