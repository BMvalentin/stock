// Traduce una violación de índice único de Prisma (P2002) a un mensaje de
// negocio en español. La restricción de la base es la última barrera contra
// duplicados: dos altas simultáneas del mismo valor pueden llegar a la DB sin
// pasar por la verificación previa.
export function mensajeConflictoUnico(
  error: unknown,
  mensajes: { barcode: string; sku: string },
): string | null {
  if (typeof error !== "object" || error === null) return null;

  if ((error as { code?: unknown }).code !== "P2002") return null;

  const objetivo = (error as { meta?: { target?: unknown } }).meta?.target;
  const campos = Array.isArray(objetivo)
    ? objetivo.join(",")
    : String(objetivo ?? "");

  if (campos.toLowerCase().includes("barcode")) return mensajes.barcode;
  if (campos.toLowerCase().includes("sku")) return mensajes.sku;

  return mensajes.sku;
}
