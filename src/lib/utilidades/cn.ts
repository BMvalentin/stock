// Une clases de Tailwind ignorando valores falsy. Evita dependencias externas.
export function cn(
  ...clases: Array<string | false | null | undefined>
): string {
  return clases.filter(Boolean).join(" ");
}
