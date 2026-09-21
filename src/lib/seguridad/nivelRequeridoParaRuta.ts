import {
  NIVEL_POR_DEFECTO,
  REGLAS_ACCESO,
  type NivelAcceso,
} from "@/constantes/acceso";

// Devuelve el nivel de acceso exigido para una ruta, aplicando la regla de
// prefijo más específica (la primera que coincida en REGLAS_ACCESO).
export function nivelRequeridoParaRuta(pathname: string): NivelAcceso {
  const coincidencia = REGLAS_ACCESO.find(
    (regla) =>
      pathname === regla.prefijo || pathname.startsWith(`${regla.prefijo}/`),
  );

  return coincidencia?.nivel ?? NIVEL_POR_DEFECTO;
}
