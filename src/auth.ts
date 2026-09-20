import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma/cliente";
import { verificarContrasena } from "@/lib/seguridad/verificarContrasena";
import { esquemaCredenciales } from "@/lib/validaciones/autenticacion";
import { googleHabilitado } from "@/lib/configuracion/googleHabilitado";

const proveedores: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Correo electrónico", type: "email" },
      contrasena: { label: "Contraseña", type: "password" },
    },
    async authorize(credenciales) {
      const resultado = esquemaCredenciales.safeParse(credenciales);

      if (!resultado.success) {
        return null;
      }

      const email = resultado.data.email.trim().toLowerCase();

      const usuario = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          rol: true,
          activo: true,
          passwordHash: true,
        },
      });

      if (!usuario || !usuario.activo || !usuario.passwordHash) {
        return null;
      }

      const contrasenaValida = await verificarContrasena(
        resultado.data.contrasena,
        usuario.passwordHash,
      );

      if (!contrasenaValida) {
        return null;
      }

      // Nunca se devuelve passwordHash.
      return {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        image: usuario.image,
        rol: usuario.rol,
      };
    },
  }),
];

if (googleHabilitado) {
  proveedores.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: proveedores,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.rol = user.rol;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.rol = token.rol ?? "EMPLEADO";
      }
      return session;
    },
  },
});
