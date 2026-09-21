# Auditoría técnica

Auditoría del estado del proyecto al cierre de la FASE 1. No se modifica código
durante una auditoría salvo que la fase lo solicite.

## Punto de partida

- El repositorio estaba **vacío** (solo `.git`, sin commits). No había código,
  dependencias ni configuración que reutilizar.
- Se creó el proyecto desde cero con `create-next-app`.

## Estado de verificación

| Comando | Resultado |
| --- | --- |
| `npx prisma validate` | OK |
| `npx prisma generate` | OK |
| `npx tsc --noEmit` | OK (sin errores) |
| `npm run lint` | OK (sin advertencias) |
| `npm run build` | OK (17 rutas) |

## Hallazgos

### Seguridad

- **Autorización server-side correcta.** `requerirSesion()` y `requerirAdmin()`
  se ejecutan en el servidor; el layout del panel y las páginas administrativas
  las invocan. La navegación solo oculta ítems de forma cosmética.
- **Sesión con revalidación en base.** `requerirSesion()` relee el usuario para
  reflejar desactivaciones y cambios de rol sin esperar un nuevo login.
- **Sin campos sensibles expuestos.** `authorize` selecciona `passwordHash` solo
  para verificar y nunca lo devuelve. No se devuelven tokens OAuth.
- **Mensajes de error genéricos** en el login ("Correo o contraseña incorrectos").
- **No se usa `proxy`/`middleware` para autenticar**, evitando el falso sentido
  de seguridad. La protección está en el layout y en cada acción.
- **Pendiente:** no hay rate limiting en el login. Se evaluará sin agregar
  dependencias innecesarias.
- **Pendiente:** `AUTH_SECRET` de desarrollo está en `.env` (no versionado).
  En producción debe generarse uno nuevo.

### Dependencias

- `npm audit` reporta **4 vulnerabilidades altas** transitivas de la CLI de
  Prisma (`deepmerge-ts`, `mysql2` vía `@prisma/config`). Son de **desarrollo**
  y no afectan al bundle de runtime. Se monitoreará una actualización.
- `next-auth` está en `5.0.0-beta.32` (Auth.js v5). Es la línea estable
  publicada y declara soporte para Next 16. Riesgo: cambios entre betas.
- `prisma`/`@prisma/client` fijados en `7.10.0` para evitar el `latest` actual,
  que apunta a un release candidate (`8.0.0-rc`).

### Arquitectura y código

- **Cumple una función exportada por archivo**, con las excepciones documentadas
  de Auth.js (`src/auth.ts`) y el Route Handler de Next (`route.ts`).
- **Ningún archivo supera 400 líneas.** Los más extensos son el schema de Prisma
  (datos, no código) y los documentos.
- **Sin lógica de negocio en componentes.** El dashboard delega en
  `servicios/dashboard/obtenerResumenDashboard`.
- **Cliente Prisma singleton** en `lib/prisma/cliente.ts`; nadie más instancia
  `PrismaClient`.
- **Páginas placeholder** para secciones futuras; devuelven UI sin lógica.

### Base de datos

- El cliente generado (`src/generated/prisma`) está correctamente ignorado en
  git y en ESLint.
- No hay migraciones creadas todavía (requiere `DATABASE_URL` real).
- Índices definidos para las consultas previstas (stock, fechas, estados,
  cliente, proveedor, usuario, auditoría). Se revisarán con datos reales.

### TypeScript

- `strict` activo, sin `any` explícitos en el código propio.
- La ampliación de tipos de Auth.js se aplica sobre `@auth/core/jwt` (no sobre
  `next-auth/jwt`, que solo reexporta). Documentado en `src/tipos/auth.d.ts`.

## Riesgos abiertos

| Riesgo | Severidad | Mitigación |
| --- | --- | --- |
| `next-auth` en beta | Media | Fijar versión; revisar changelog al actualizar. |
| Sin rate limiting en login | Media | Implementar antes de exponer a internet. |
| Sin migraciones aplicadas | Alta | Ejecutar `prisma migrate dev` con la URL real. |
| Vulnerabilidades transitivas de la CLI Prisma | Baja (dev) | Monitorear actualización de Prisma. |
| Sin tests automatizados | Media | Agregar pruebas de servicios críticos (stock, envíos, estados). |

## Próximos pasos recomendados

1. Configurar `DATABASE_URL` real y correr `prisma migrate dev`.
2. Ejecutar `prisma db seed` para crear el administrador inicial.
3. Implementar FASE 3 (productos y categorías) con transacciones y auditoría.
4. Agregar rate limiting en el login.
5. Incorporar tests de las reglas de negocio críticas.

## Actualizaciones posteriores

### Cuentas de pago de proveedores

- Nueva entidad `CuentaPagoProveedor` (relación 1:N con `Proveedor`) y enums
  `MetodoPagoProveedor` / `TipoCuentaProveedor`. Migración
  `0003_cuentas_pago_proveedor`.
- Acciones de auditoría: `CUENTA_PAGO_PROVEEDOR_CREADA`,
  `CUENTA_PAGO_PROVEEDOR_EDITADA`, `CUENTA_PAGO_PROVEEDOR_PRINCIPAL_CAMBIADA`,
  `CUENTA_PAGO_PROVEEDOR_ACTIVADA`, `CUENTA_PAGO_PROVEEDOR_DESACTIVADA`.
- La metadata de auditoría guarda CBU/CVU **enmascarados**; nunca completos.
- Los datos de pago solo se consultan y muestran para `ADMIN`.

### Módulo de pedidos

- Migración `0004_pedidos_unidad_venta_y_entrega` (no destructiva):
  `Producto.unidadVenta`, `Producto.stockActual`/`stockMinimo`,
  `MovimientoStock` (cantidad y saldos) y `DetallePedido.cantidad` pasan a
  `Decimal(12,3)`; `DetallePedido.unidadVenta`; `Pedido.referenciaEntrega`,
  `mapsUrl`, `latitud`, `longitud`.
- Nueva creación de pedidos: `/pedidos/nuevo`, `crearPedido`,
  `calcularTotalesPedido`, `validarStockPedido`, `calcularCostoEnvio`,
  `buscarProductosParaPedido` y las acciones `accionCrearPedido`,
  `accionBuscarProductosPedido`, `accionCalcularResumenPedido`.
- El descuento de stock al confirmar usa actualización condicional
  (`stockActual >= cantidad`) para evitar stock negativo en concurrencia.
- Auditoría `PEDIDO_CREADO` con metadata: número, cantidad de productos, total,
  método de pago y tipo de entrega. No se duplica información personal.
