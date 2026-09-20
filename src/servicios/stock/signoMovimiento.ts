import type { TipoMovimiento } from "@/generated/prisma/enums";

// Signo del impacto en el stock según el tipo de movimiento.
export function signoMovimiento(tipo: TipoMovimiento): 1 | -1 {
  switch (tipo) {
    case "INGRESO":
    case "AJUSTE_POSITIVO":
    case "DEVOLUCION":
      return 1;
    default:
      return -1;
  }
}
