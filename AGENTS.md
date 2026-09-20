<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas permanentes del proyecto

Sistema interno de gestión de stock, productos y pedidos para un comercio.
Arquitectura por dominio. Next.js (App Router) + TypeScript + Prisma 7 +
PostgreSQL + Auth.js (NextAuth v5) + Tailwind CSS + Zod.

## Idioma

Todo el código nuevo debe estar en español:

- nombres de variables, funciones, componentes, carpetas y archivos;
- comentarios y mensajes de UI.

Excepciones (nombres requeridos por la tecnología, no traducir):

- APIs de librerías (Next.js, React, Prisma, Auth.js);
- convenciones de framework (`page.tsx`, `layout.tsx`, `route.ts`, `use server`, `use client`);
- nombres de paquetes y de variables de entorno;
- nombres de modelos y campos de `schema.prisma` (Prisma exige PascalCase/camelCase);
- valores de enums de Prisma (MAYÚSCULAS).

## Estructura y responsabilidades

- `src/app/**`: rutas y composición de UI. Sin lógica de negocio.
- `src/acciones/**`: Server Actions. Flujo obligatorio:
  `validación Zod -> autenticación -> autorización -> regla de negocio -> service -> Prisma -> revalidación -> respuesta`.
- `src/servicios/**`: reglas de negocio, consultas Prisma reutilizables, cálculos y transacciones. No autentican.
- `src/lib/seguridad/**`: `requerirSesion`, `requerirAdmin`, hash de contraseñas.
- `src/lib/validaciones/**`: esquemas Zod.
- `src/lib/prisma/**`: instancia única de Prisma Client.
- `src/componentes/**`: componentes de UI por dominio.
- `src/constantes/**` y `src/tipos/**`: constantes y tipos compartidos.

## Reglas de código

1. **Una función exportada por archivo.** Si se necesitan varias, separar en archivos.
   Los archivos de tipos, interfaces y constantes pueden exportar varios símbolos.
2. **Tamaño máximo:** 400 líneas por archivo de código (objetivo: 300). Si se supera, dividir.
3. **Validación con Zod** de toda entrada del usuario. Nunca confiar solo en el frontend.
4. **Autorización siempre en el servidor.** Ocultar botones no autoriza nada.
   Toda Server Action administrativa llama a `requerirAdmin()`.
5. **Operaciones que afectan stock o dinero** se ejecutan con `prisma.$transaction`,
   con validación de stock e idempotencia (banderas en `Pedido`).
6. **Nunca devolver campos sensibles** (`passwordHash`, tokens, secretos). Usar `select` explícito.
7. **Eliminación lógica** (`activo = false`) para productos, categorías, proveedores y empleados.
8. **Precios congelados:** un pedido histórico nunca se recalcula con el precio actual.
9. **No hardcodear** datos del comercio: precios de envío, métodos de pago, categorías y
   reglas configurables viven en la base de datos.

## Excepciones documentadas a "una función exportada por archivo"

- `src/auth.ts`: Auth.js exige exportar `handlers`, `auth`, `signIn` y `signOut`.
- `src/app/api/auth/[...nextauth]/route.ts`: Next.js exige exportar `GET` y `POST`.

## Comandos de verificación

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run lint
npm run build
```
