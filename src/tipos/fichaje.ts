import type { ResultadoFichajeQR } from "@/servicios/asistencias/registrarFichajeQR";

// Estado del formulario de fichaje por QR.
export type EstadoFichajeQR = {
  exito?: boolean;
  error?: string;
  resultado?: ResultadoFichajeQR;
};

export const ESTADO_FICHAJE_QR_INICIAL: EstadoFichajeQR = {};

// Token y QR generados para la pantalla del comercio.
export type TokenQRGenerado = {
  token: string;
  expiraEn: string;
  qrSvg: string;
};

export type EstadoGeneracionQR =
  | { exito: true; datos: TokenQRGenerado }
  | { exito: false; error: string };
