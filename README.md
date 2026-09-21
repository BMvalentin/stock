# Sistema de Gestión de Stock, Productos y Pedidos

Aplicación web interna para administrar productos, categorías, stock,
proveedores, movimientos, pedidos, pagos, envíos, empleados,
reportes y auditoría de un comercio.

## Stack

- Next.js 16 (App Router) + TypeScript
- Prisma 7 + TiDB Cloud (protocolo MySQL)
- Auth.js v5 (NextAuth) — correo/contraseña y Google OAuth
- Tailwind CSS v4
- Zod 4

## Requisitos

- Node.js 20.9 o superior
- Una base de datos TiDB Cloud / MySQL accesible (`DATABASE_URL`)

## Puesta en marcha

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear `.env` a partir de `.env.example` y completar:

   ```env
   DATABASE_URL="mysql://usuario:contrasena@host:4000/basededatos?sslaccept=strict"
   AUTH_SECRET="<openssl rand -base64 32>"
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   ADMIN_EMAIL="admin@ejemplo.com"
   ADMIN_PASSWORD="cambiar-esta-clave"
   ```

3. Aplicar el esquema y generar el cliente:

   ```bash
   npx prisma migrate dev --name inicial
   npx prisma generate
   ```

4. Crear el administrador y los datos base:

   ```bash
   npx prisma db seed
   ```

5. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abrir http://localhost:3000 e ingresar con `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Google OAuth (opcional)

Configurar las credenciales en Google Cloud Console y definir
`GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`. Si faltan, el botón "Continuar con
Google" no se muestra y el proveedor no se registra.

## Roles

- **ADMIN**: acceso completo.
- **EMPLEADO**: solo lectura en Dashboard, Productos, Stock, Proveedores y
  Pedidos. Sin acceso a secciones administrativas.

La autorización se aplica siempre en el servidor.

## Comandos

```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm run start      # servidor de producción
npm run lint       # ESLint
npx tsc --noEmit   # verificación de tipos
npx prisma validate
npx prisma generate
npx prisma db seed
```

## Documentación

- [`ARQUITECTURA.md`](./ARQUITECTURA.md) — capas, estructura y autenticación.
- [`REGLAS_NEGOCIO.md`](./REGLAS_NEGOCIO.md) — reglas de stock, pedidos, pagos y envíos.
- [`DECISIONES_PENDIENTES.md`](./DECISIONES_PENDIENTES.md) — ambigüedades y su estado.
- [`AUDITORIA.md`](./AUDITORIA.md) — auditoría técnica del proyecto.
- [`AGENTS.md`](./AGENTS.md) — reglas permanentes de desarrollo.

## Estado

FASE 1 completada: base del proyecto, esquema de datos, autenticación, roles,
dashboard y navegación. Las secciones de catálogo, stock, pedidos, pagos,
envíos y reportes se implementarán en fases posteriores.
