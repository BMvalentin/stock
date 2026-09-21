# Arquitectura

## Stack

| Componente | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Lenguaje | TypeScript 5 (strict) |
| Runtime | Node.js 20.9+ |
| ORM | Prisma 7 (`prisma-client` + driver adapter `@prisma/adapter-mariadb`) |
| Base de datos | TiDB Cloud (protocolo MySQL) |
| Autenticación | Auth.js v5 (NextAuth) — Credentials + Google OAuth |
| UI | Tailwind CSS v4 |
| Validación | Zod 4 |
| Hash de contraseñas | bcryptjs (12 rondas) |

## Capas y flujo

```text
UI (Server/Client Components)
        ↓
Server Action  →  validación Zod → requerirSesion/requerirAdmin
        ↓
Servicio (reglas de negocio, cálculos, transacciones)
        ↓
Prisma Client (driver adapter MariaDB/MySQL)
        ↓
TiDB Cloud (protocolo MySQL)
```

Reglas de dependencia:

- `app/**` compone UI y delega en acciones/servicios. No contiene reglas de negocio.
- `acciones/**` valida, autentica, autoriza y llama a un servicio. Una función por archivo.
- `servicios/**` contiene la lógica de negocio y las consultas Prisma. No autentica.
- `lib/**` utilidades transversales (prisma, seguridad, validaciones, utilidades, configuración).
- Nadie fuera de `lib/prisma` instancia `PrismaClient`.

## Estructura de carpetas

```text
prisma/
├── schema.prisma
└── seed.ts
prisma7.config.ts              # configuración de la CLI de Prisma 7
src/
├── app/
│   ├── (panel)/               # layout protegido + secciones internas
│   │   ├── layout.tsx         # requerirSesion() + navegación por rol
│   │   ├── dashboard/page.tsx
│   │   ├── productos/page.tsx
│   │   ├── categorias/page.tsx
│   │   ├── proveedores/page.tsx
│   │   ├── stock/page.tsx
│   │   ├── movimientos/page.tsx
│   │   ├── pedidos/page.tsx
│   │   ├── pedidos/nuevo/page.tsx
│   │   ├── pedidos/[id]/page.tsx
│   │   ├── reportes/page.tsx
│   │   ├── empleados/page.tsx
│   │   ├── configuracion/page.tsx
│   │   └── auditoria/page.tsx
│   ├── api/auth/[...nextauth]/route.ts
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── page.tsx               # redirige a /dashboard
├── acciones/
│   └── autenticacion/
├── componentes/
│   ├── autenticacion/
│   └── comunes/
├── servicios/
│   └── dashboard/
├── lib/
│   ├── prisma/
│   ├── seguridad/
│   ├── validaciones/
│   ├── utilidades/
│   └── configuracion/
├── constantes/
├── tipos/
└── generated/prisma/          # cliente Prisma generado (no versionado)
```

## Autenticación y sesión

- Estrategia de sesión **JWT** (requerida por el proveedor Credentials).
- El adaptador Prisma persiste `User`, `Account`, `Session`, `VerificationToken`.
- El JWT transporta `id` y `rol`; los tipos se amplían en `src/tipos/auth.d.ts`
  (`next-auth` y `@auth/core/jwt`).
- `requerirSesion()` vuelve a leer el usuario desde la base para reflejar
  desactivaciones o cambios de rol sin esperar a un nuevo login.
- `requerirAdmin()` envuelve a `requerirSesion()` y exige rol `ADMIN`.

## Protección de rutas

- `src/app/(panel)/layout.tsx` llama a `requerirSesion()`: ninguna página interna
  se renderiza sin sesión válida.
- Las secciones administrativas llaman además a `requerirAdmin()`.
- La navegación filtra los ítems por rol, pero eso es solo cosmético: la
  autorización real ocurre en el servidor.

## Decisiones de Next.js 16 relevantes

- La convención `middleware` fue renombrada a `proxy`; no se usa proxy para
  autenticación (se protege en cada layout/Server Action).
- `cookies()`, `headers()`, `params` y `searchParams` son asíncronos.
- Turbopack es el bundler por defecto en `dev` y `build`.
- El tipado de rutas se genera con `npx next typegen`.

## Variables de entorno

Ver `.env.example`. `DATABASE_URL` y `AUTH_SECRET` son obligatorias.
`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` son opcionales: si faltan, el
proveedor de Google no se registra y el botón no se muestra.

## Módulo de pedidos

- Los pedidos se crean desde `/pedidos/nuevo` (solo ADMIN) y se administran en
  `/pedidos` y `/pedidos/[id]`.
- La creación se orquesta en `servicios/pedidos/crearPedido`, que reutiliza
  `calcularTotalesPedido` (precios con `Prisma.Decimal`), `validarStockPedido` y
  `calcularCostoEnvio` (sobre `ConfiguracionEnvio`). El cliente nunca fija
  precios ni totales.
- Modalidad de venta por producto (`Producto.unidadVenta`): `UNIDAD` o
  `KILOGRAMO`. El pedido congela la modalidad en `DetallePedido.unidadVenta`.
- Precisión: stock y cantidades en `Decimal(12,3)`; dinero en `Decimal(12,2)`.
- Entrega: snapshot en `Pedido` (dirección, localidad, referencia, `mapsUrl`,
  `latitud`, `longitud`). La URL de Maps se valida en
  `lib/validaciones/ubicacion` (extensible a otros proveedores).
- El stock se valida al crear y se descuenta al pasar a `CONFIRMADO` con una
  actualización condicional (sin stock negativo en concurrencia).
