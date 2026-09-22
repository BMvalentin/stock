import type { UnidadVenta } from "@/generated/prisma/enums";
import type { ModalidadEntrada } from "@/tipos/producto";

// Unidad canónica del stock de un producto: si tiene alguna modalidad por
// kilogramo, el stock se lleva en kg; si no, en unidades.
export function derivarUnidadStock(modalidades: ModalidadEntrada[]): UnidadVenta {
  return modalidades.some((modalidad) => modalidad.unidadVenta === "KILOGRAMO")
    ? "KILOGRAMO"
    : "UNIDAD";
}
