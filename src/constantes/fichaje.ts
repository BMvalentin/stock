// Constantes del fichaje por QR.
//
// El token viaja dentro del QR con un prefijo para distinguirlo de otros
// códigos. El servidor nunca confía en el contenido: valida el token contra la
// base y obtiene la identidad del empleado de la sesión autenticada.

import type { AccionFichaje } from "@/tipos/asistencia";

export const PREFIJO_FICHAJE_QR = "FICHAJE_QR:";

export const ETIQUETAS_ACCION_FICHAJE: Record<AccionFichaje, string> = {
  ENTRADA_TRAMO_1: "Entrada 1 registrada",
  SALIDA_TRAMO_1: "Salida 1 registrada",
  ENTRADA_TRAMO_2: "Entrada 2 registrada",
  SALIDA_TRAMO_2: "Salida 2 registrada",
};

// Vigencia de cada token generado en la pantalla del comercio.
export const DURACION_TOKEN_FICHAJE_MS = 45_000;

// Ventana durante la cual un segundo escaneo del mismo empleado se considera
// duplicado accidental y no genera un fichaje nuevo.
export const VENTANA_IDEMPOTENCIA_FICHAJE_MS = 60_000;
