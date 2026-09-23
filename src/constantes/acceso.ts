// Política de acceso centralizada por prefijo de ruta. Es la única fuente de
// verdad para decidir qué nivel exige cada ruta; la usan el proxy (gate
// optimista) y las utilidades de autorización de servidor.
//
// El orden importa: las reglas más específicas van primero. La primera regla
// cuyo prefijo coincida con la ruta gana.

export type NivelAcceso = "PUBLICO" | "EMPLEADO" | "ADMIN";

export type ReglaAcceso = {
  prefijo: string;
  nivel: NivelAcceso;
};

export const REGLAS_ACCESO: ReglaAcceso[] = [
  // Área del empleado: solo rol EMPLEADO.
  { prefijo: "/empleado", nivel: "EMPLEADO" },
  // Panel administrativo: solo rol ADMIN.
  { prefijo: "/admin", nivel: "ADMIN" },
  { prefijo: "/login", nivel: "PUBLICO" },
  { prefijo: "/api/auth", nivel: "PUBLICO" },
];

// Nivel aplicado a rutas que no coinciden con ninguna regla. Se usa el nivel
// más restrictivo por defecto: lo no listado exige ADMIN.
export const NIVEL_POR_DEFECTO: NivelAcceso = "ADMIN";
