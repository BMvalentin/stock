// Normaliza un CBU o CVU a solo dígitos. El valor normalizado se persiste así
// sin importar cómo lo escribió el usuario (espacios, guiones, puntos).
export function normalizarCbuCvu(valor: string): string {
  return valor.replace(/\D/g, "");
}
