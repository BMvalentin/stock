// Filtro de unicidad del SKU. Devuelve `null` cuando no hay que validar nada
// (SKU vacío o nulo: permitido y persistido como NULL), el filtro simple al
// crear y el filtro con exclusión del propio producto al editar. Así la regla
// vive en un único lugar: un producto nunca se detecta como duplicado de sí
// mismo.
export function filtrarSkuDuplicado(
  sku: string | null,
  idExcluir?: string,
): { sku: string; NOT?: { id: string } } | null {
  if (!sku || !sku.trim()) return null;

  return idExcluir ? { sku, NOT: { id: idExcluir } } : { sku };
}
