"use server";

import QRCode from "qrcode";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { generarTokenFichajeQR } from "@/servicios/asistencias/generarTokenFichajeQR";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";
import { PREFIJO_FICHAJE_QR } from "@/constantes/fichaje";
import type { EstadoGeneracionQR } from "@/tipos/fichaje";

// Genera un token temporal de fichaje y su QR (SVG) para la pantalla del
// comercio. Solo un ADMIN puede generarlo. El QR contiene el token con prefijo;
// nunca datos del empleado.
export async function accionGenerarTokenFichajeQR(): Promise<EstadoGeneracionQR> {
  const usuario = await requerirAdmin();

  try {
    const { token, expiraEn } = await generarTokenFichajeQR(usuario.id);

    const qrSvg = await QRCode.toString(`${PREFIJO_FICHAJE_QR}${token}`, {
      type: "svg",
      margin: 1,
      width: 360,
      errorCorrectionLevel: "M",
    });

    return {
      exito: true,
      datos: { token, expiraEn: expiraEn.toISOString(), qrSvg },
    };
  } catch (error) {
    if (error instanceof ErrorNegocio) {
      return { exito: false, error: error.message };
    }
    throw error;
  }
}
