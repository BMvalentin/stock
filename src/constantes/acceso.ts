// Política de acceso centralizada por prefijo de ruta. Es la única fuente de
// verdad para decidir qué nivel exige cada ruta; la usan el proxy (gate
// optimista) y las utilidades de autorización de servidor.
//
// El orden importa: las reglas más específicas van primero. La primera regla
// cuyo prefijo coincida con la ruta gana.

export type NivelAcceso = "PUBLICO" | "AUTENTICADO" | "ADMIN";

export type ReglaAcceso = {
  prefijo: string;
  nivel: NivelAcceso;
};

export const REGLAS_ACCESO: ReglaAcceso[] = [
  // Área exclusivamente administrativa (route group (soloAdmin)).
  { prefijo: "/admin/categorias", nivel: "ADMIN" },
  { prefijo: "/admin/movimientos", nivel: "ADMIN" },
  { prefijo: "/admin/reportes", nivel: "ADMIN" },
  { prefijo: "/admin/empleados", nivel: "ADMIN" },
  { prefijo: "/admin/configuracion", nivel: "ADMIN" },
  { prefijo: "/admin/auditoria", nivel: "ADMIN" },
  { prefijo: "/admin/asistencia/qr", nivel: "ADMIN" },
  // Resto del panel: cualquier usuario autenticado (ADMIN o EMPLEADO).
  { prefijo: "/admin", nivel: "AUTENTICADO" },
  { prefijo: "/login", nivel: "PUBLICO" },
];

// Nivel aplicado a rutas que no coinciden con ninguna regla.
export const NIVEL_POR_DEFECTO: NivelAcceso = "AUTENTICADO";
