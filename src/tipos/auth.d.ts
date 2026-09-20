import type { DefaultSession } from "next-auth";
import type { Rol } from "@/generated/prisma/enums";

// Aumenta los tipos de Auth.js para exponer id y rol de forma segura.
declare module "next-auth" {
  interface User {
    rol?: Rol;
  }

  interface Session {
    user: {
      id: string;
      rol: Rol;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    rol?: Rol;
  }
}
