// Determina si una ruta de navegación es la sección activa. Las raíces de
// área (/admin, /empleado) solo marcan activo con coincidencia exacta para no
// resaltar el Dashboard en las secciones hijas.
export function esRutaActiva(rutaActual: string, ruta: string): boolean {
  const esRaiz = ruta === "/admin" || ruta === "/empleado";

  if (esRaiz) {
    return rutaActual === ruta;
  }

  return rutaActual === ruta || rutaActual.startsWith(`${ruta}/`);
}
