// Tamaño de página por defecto y valores permitidos. El cliente nunca puede
// pedir un tamaño arbitrario: solo los listados en TAMANOS_PAGINA.
export const PAGINA_POR_DEFECTO = 20;

export const TAMANOS_PAGINA = [10, 25, 50] as const;

export const TAMANO_PAGINA_MAX = 100;
