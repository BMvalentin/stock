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
├── proxy.ts                    # gate optimista de sesión para /admin
├── app/
│   ├── admin/                  # panel interno (layout protegido)
│   │   ├── layout.tsx          # requerirSesion() + navegación por rol
│   │   ├── page.tsx            # dashboard (raíz /admin)
│   │   ├── (soloAdmin)/        # route group: exige requerirAdmin()
│   │   │   ├── layout.tsx      # gate centralizado de ADMIN
│   │   │   ├── categorias/
│   │   │   ├── movimientos/
│   │   │   ├── reportes/
│   │   │   ├── empleados/
│   │   │   ├── configuracion/
│   │   │   ├── auditoria/
│   │   │   └── asistencia/qr/
│   │   ├── productos/          # lectura para ADMIN y EMPLEADO
│   │   ├── proveedores/
│   │   ├── stock/
│   │   ├── pedidos/
│   │   └── asistencia/fichar/
│   ├── api/auth/[...nextauth]/route.ts
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── page.tsx               # redirige a /admin
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

- `src/proxy.ts` es un gate optimista: sin cookie de sesión, redirige `/admin/*`
  al login. No es la frontera de seguridad.
- `src/app/admin/layout.tsx` llama a `requerirSesion()`: ninguna página interna
  se renderiza sin sesión válida.
- `src/app/admin/(soloAdmin)/layout.tsx` llama a `requerirAdmin()` y centraliza
  la autorización del área exclusivamente administrativa.
- La política de acceso por prefijo vive en `src/constantes/acceso.ts` y se
  evalúa con `nivelRequeridoParaRuta` / `puedeAcceder`.
- Las Server Actions administrativas siguen llamando a `requerirAdmin()`
  (defensa en profundidad). `requerirSesion()` está envuelto en `cache()` para
  deduplicar la lectura del usuario dentro de una misma request.
- La navegación filtra los ítems por rol, pero eso es solo cosmético: la
  autorización real ocurre en el servidor.

## Decisiones de Next.js 16 relevantes

- La convención `middleware` fue renombrada a `proxy`. Se usa `proxy.ts` como
  gate optimista de sesión; la autorización real se valida en el servidor
  (layouts y Server Actions).
- `cookies()`, `headers()`, `params` y `searchParams` son asíncronos.
- Turbopack es el bundler por defecto en `dev` y `build`.
- El tipado de rutas se genera con `npx next typegen`.

## Paginación, filtros e índices

- Paginación real en base (`skip`/`take` + `count`) en todos los listados que
  pueden crecer: productos, stock, movimientos, pedidos, auditoría, empleados,
  categorías, proveedores, asistencias, producciones y liquidaciones.
- Parámetros de listado validados con Zod (`src/lib/validaciones/paginacion.ts`):
  `pagina >= 1` y `porPagina` limitado a `10 | 25 | 50` (máximo 100).
- El componente `src/componentes/ui/Paginacion.tsx` ofrece primera/anterior,
  números, siguiente/última, total de registros y selector de tamaño de página.
- Ordenamiento por whitelist en cada servicio (nunca se pasa un campo crudo del
  usuario a Prisma).
- Búsqueda de productos: `startsWith` en `sku`/`barcode` (usa índice único) y
  `contains` en `nombre`.
- Índices compuestos de filtro+orden en `prisma/migrations/0007_indices_performance`
  (migración no destructiva). Se verifican con `SHOW INDEX FROM` en TiDB.

## Variables de entorno

Ver `.env.example`. `DATABASE_URL` y `AUTH_SECRET` son obligatorias.
`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` son opcionales: si faltan, el
proveedor de Google no se registra y el botón no se muestra.

`AUTH_URL` **no** es necesaria y no debe configurarse en Vercel: `trustHost: true`
en `src/auth.ts` resuelve el host desde `x-forwarded-host`. Definirla con
`localhost` en producción hace que Google reciba
`http://localhost:3000/api/auth/callback/google` y el login falla con
`error=Configuration`. En local puede usarse `AUTH_URL="http://localhost:3000"`.

## Módulo de remuneración de empleados

- `Empleado` es un perfil 1:1 con `User` (`userId @unique`). Separa los datos
  salariales de la autenticación; la baja lógica sigue siendo `User.activo`.
- Entidades: `Empleado`, `EmpleadoAsistencia`, `EmpleadoTarifaProducto`,
  `EmpleadoProduccion` y `EmpleadoLiquidacion` (migración
  `0005_remuneracion_empleados`, no destructiva, con backfill de perfiles).
- Fechas de calendario en `@db.Date` y horas como texto `"HH:mm"`: los cálculos
  de minutos no dependen de la zona horaria del servidor. La zona del comercio
  vive en `constantes/zonaHoraria`.
- Cálculos en servicios puros: `calcularRemuneracionPorHora`,
  `calcularRemuneracionProduccion` y `calcularLiquidacionEmpleado` (elige la
  fórmula según `Empleado.tipoRemuneracion`). Dinero siempre con
  `Prisma.Decimal`.
- Snapshots: `EmpleadoProduccion.precioUnidad/total` y
  `EmpleadoLiquidacion.total/detalle` congelan los valores históricos.
- Rutas: `/admin/empleados/[id]` (remuneración y tarifas),
  `/admin/empleados/[id]/asistencia`, `/admin/empleados/[id]/produccion` y
  `/admin/empleados/[id]/liquidacion` (con detalle por liquidación). Todas
  exigen `requerirAdmin()`.

## Fichaje por QR y jornada partida

- `EmpleadoAsistencia` soporta hasta dos tramos con columnas planas
  (`horaEntrada`/`horaSalida` y `horaEntradaTramo2`/`horaSalidaTramo2`) y guarda
  retrasos totales y por tramo. `minutosTrabajados`/`minutosRetraso` son los
  totales del día (snapshot histórico).
- `TokenFichajeQR` guarda solo el hash de un token temporal (45 s). La pantalla
  `/admin/asistencia/qr` (ADMIN) lo genera y renueva; el teléfono lo escanea
  desde `/admin/asistencia/fichar` (cualquier usuario autenticado) con
  `EscanerQR`.
- La identidad del empleado surge de la sesión (`usuario → empleado`); el QR no
  contiene el id. La secuencia de fichaje la decide el servidor en una
  transacción (`registrarFichajeQR`), con idempotencia por `ultimoFichajeEn`.
- Cálculos puros en `determinarProximoFichaje`, `calcularMinutosJornada` y
  `calcularEstadoJornada`; la liquidación usa `calcularRemuneracionPorHora`
  (jornada partida y exclusión de jornadas incompletas).
- Migración `0006_asistencia_jornada_partida_qr` (no destructiva: agrega
  columnas y la tabla de tokens, con backfill de `minutosRetrasoTramo1`).
- El escáner de cámara se generalizó en `EscanerCamara`; `EscanerCodigoBarras` y
  `EscanerQR` lo reutilizan con `@zxing/browser`.

## Módulo de pedidos

- Los pedidos se crean desde `/admin/pedidos/nuevo` (solo ADMIN) y se
  administran en `/admin/pedidos` y `/admin/pedidos/[id]`.
- La creación se orquesta en `servicios/pedidos/crearPedido`, que reutiliza
  `calcularTotalesPedido` (precios con `Prisma.Decimal`), `validarStockPedido` y
  `calcularCostoEnvio` (sobre `ConfiguracionEnvio`). El cliente nunca fija
  precios ni totales.
- Modalidad de venta por producto mediante `ModalidadVenta` (una o varias). El
  pedido congela la modalidad en `DetallePedido.modalidadNombre`, `unidadVenta`,
  `contenido` y `desglosePrecio`.
- Precios: el motor puro `servicios/precios/calcularPrecioLinea` resuelve el
  precio a partir de las `ReglaPrecio` de la modalidad (escalas por cantidad y
  promociones `TOTAL`, con método de pago específico o genérico). Ver
  “Módulo de precios”.
- Precisión: stock y cantidades en `Decimal(12,3)`; dinero en `Decimal(12,2)`.
- Entrega: snapshot en `Pedido` (dirección, localidad, referencia, `mapsUrl`,
  `latitud`, `longitud`). La URL de Maps se valida en
  `lib/validaciones/ubicacion` (extensible a otros proveedores).
- El stock se valida al crear y se descuenta al pasar a `CONFIRMADO` con una
  actualización condicional (sin stock negativo en concurrencia).

## Módulo de precios (modalidades y reglas)

- Entidades: `ModalidadVenta`, `ReglaPrecio` y `ReglaPrecioHistorial` (migración
  `0010_modalidades_y_reglas_precio`, aditiva con backfill). Reemplazan el modelo
  plano `PrecioProducto`/`PrecioProductoSuelto`, que queda como legado.
- Un producto tiene una o varias modalidades (`unidadVenta`, `contenido`,
  `etiquetaPresentacion`, `esBase`). `Producto.unidadStock` es la unidad canónica
  del stock (`KILOGRAMO` si hay modalidad por kg).
- Cada modalidad tiene reglas de precio: rango `cantidadDesde`/`cantidadHasta`,
  `tipoPrecio` (`UNITARIO` o `TOTAL`), `precio` y `metodoPagoId` opcional.
- Cálculo en un servicio puro y testeado
  (`servicios/precios/calcularPrecioLinea.ts`):
  1. usa reglas específicas del método de pago; si no cubren, las genéricas;
  2. combina promociones `TOTAL` en múltiplos completos con el resto al precio
     `UNITARIO` de la escala, eligiendo el menor costo (DP en milésimas);
  3. devuelve `precioUnitario`, `subtotal` y un `desglose` con los packs.
- Tests en `servicios/precios/precio.test.ts` (`npm test`).
- Historial y auditoría: al cambiar el precio de una regla se registra
  `ReglaPrecioHistorial` y `PRECIO_MODIFICADO`.
- Persistencia y edición: `guardarModalidadesProducto` reconcilia modalidades y
  reglas (baja lógica de las que ya no vienen; historial de precios al cambiar).
- Snapshot: `DetallePedido` congela modalidad, contenido, precio, subtotal y
  desglose. Un pedido histórico no se recalcula.
- Administración: sección "Modalidades y precios" en el formulario de producto
  (`SeccionModalidadesPrecios`). Productos simples usan una sola modalidad con
  un precio; las escalas y promociones son opcionales.
