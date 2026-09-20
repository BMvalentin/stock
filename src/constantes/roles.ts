import type { Rol } from "@/generated/prisma/enums";

export const ETIQUETAS_ROL: Record<Rol, string> = {
  ADMIN: "Administrador",
  EMPLEADO: "Empleado",
};

export const ROLES: Rol[] = ["ADMIN", "EMPLEADO"];
