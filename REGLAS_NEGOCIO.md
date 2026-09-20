# Reglas de negocio

Documento de referencia de las reglas acordadas. Es la fuente de verdad para
implementar y auditar el sistema.

## Roles y permisos

| Sección | ADMIN | EMPLEADO |
| --- | --- | --- |
| Dashboard | completo | operativo (lectura) |
| Productos | crear/editar/desactivar | solo lectura |
| Categorías | crear/editar/desactivar | sin acceso |
| Proveedores | crear/editar/desactivar/contactar | solo lectura + contactar |
| Stock | ingresos/egresos/ajustes | solo lectura |
| Movimientos | consultar/filtrar | sin acceso |
| Pedidos | crear/editar/estados/pagos | solo lectura |
| Clientes | crear/editar/desactivar | sin acceso (ve datos mínimos dentro del pedido) |
| Reportes | completo | sin acceso |
| Empleados | crear/desactivar | sin acceso |
| Configuración | completo | sin acceso |
| Auditoría | consultar | sin acceso |

Reglas:

- La autorización se controla **siempre en el servidor** (`requerirSesion`,
  `requerirAdmin`). Ocultar botones no autoriza.
- El EMPLEADO tiene acceso de **solo lectura** a Dashboard, Productos, Stock,
  Proveedores y Pedidos.
- Dentro de un pedido, el EMPLEADO ve del cliente solo `nombre`, `teléfono`,
  `dirección` y `localidad`.

## Stock

- El stock **no se modifica sin generar un movimiento**. Toda variación crea un
  `MovimientoStock`.
- Tipos de movimiento: `INGRESO`, `EGRESO`, `AJUSTE_POSITIVO`, `AJUSTE_NEGATIVO`,
  `VENTA`, `DEVOLUCION`.
- Cada movimiento registra: producto, tipo, cantidad, stock anterior, stock
  posterior, usuario, motivo, pedido opcional y fecha.
- `stockActual` nunca puede quedar por debajo de 0. No se admite `stock = -1`.
- Operaciones de stock y dinero se ejecutan en `prisma.$transaction`.
- Las operaciones son **idempotentes** (ver "Idempotencia").

## Precios

- Los precios viven en la tabla `PrecioProducto` (una fila por producto y método
  de pago). No se hardcodean columnas como "precioEfectivo"/"precioTransferencia".
- Métodos iniciales: `EFECTIVO`, `TRANSFERENCIA`. La tabla `MetodoPago` permite
  agregar tarjeta, Mercado Pago, financiación, etc. sin migrar el esquema.
- Al crear un pedido, el precio usado se **congela** en `DetallePedido.precioUnitario`.
- Un pedido histórico **nunca** se recalcula con el precio actual del producto.
- Cambiar un precio registra `PrecioProductoHistorial` y una entrada de auditoría.

## Pedidos

Estados: `PENDIENTE`, `CONFIRMADO`, `PREPARANDO`, `LISTO`, `ENTREGADO`, `CANCELADO`.

Máquina de estados (centralizada en un servicio `puedeCambiarEstadoPedido`):

```text
PENDIENTE → CONFIRMADO → PREPARANDO → LISTO → ENTREGADO
     └──────────┴────────────┴──────────┘
                     ↓
                 CANCELADO
```

- No se permiten transiciones arbitrarias.
- `ENTREGADO` y `CANCELADO` son terminales.
- El pedido guarda datos del cliente y detalles con nombre y precio congelados.
- `estadoPedido` y `estadoPago` son independientes: un pedido entregado puede
  estar impago y viceversa.

### Stock y pedidos

- El stock se descuenta **al pasar el pedido a `CONFIRMADO`** (movimiento `VENTA`).
- Al confirmar se marca `stockDescontado = true` para no descontar dos veces.
- Al cancelar un pedido ya descontado se genera un movimiento `DEVOLUCION` y se
  marca `stockDevuelto = true`. No se devuelve stock dos veces.

## Pagos

Estados: `PENDIENTE`, `AVISADO`, `CONFIRMADO`, `RECHAZADO`.

- Flujo por transferencia: `PENDIENTE → AVISADO` (el usuario avisa el pago)
  `→ CONFIRMADO` (un ADMIN confirma) o `RECHAZADO`.
- Flujo por efectivo: el ADMIN registra la recepción del efectivo.
- Solo un ADMIN puede confirmar o rechazar pagos.
- El total del pedido no se modifica al registrar un pago; se registran pagos
  parciales o totales en la tabla `Pago`.

## Envíos

- La lógica de cálculo vive en un servicio independiente (nunca en componentes).
- Tipos de cálculo (`ConfiguracionEnvio.tipo`):
  - `SIN_CARGO`: envío = 0.
  - `TARIFA_FIJA`: envío = `precio`, sin importar la cantidad.
  - `POR_PRODUCTO`: envío = `precio × total de unidades`.
  - `POR_BULTO`: envío = `precio × total de bultos`.
- v1: `1 producto = 1 bulto`. `Producto.unidadesPorBulto` (default 1) permite
  evolucionar a "1 bulto cada N unidades" sin migrar el esquema.
- El costo de envío se congela en `Pedido.costoEnvio` al crear/editar el pedido.

## Proveedores

- Relación N:M entre `Producto` y `Proveedor` mediante `ProductoProveedor`.
- Un producto puede tener varios proveedores y uno marcado como principal
  (`esPrincipal`).
- Contacto directo: llamada (`telefono`), WhatsApp (`whatsapp`) y email.
- El enlace de WhatsApp se genera a partir del número almacenado.
- No existe chat interno con proveedores.

## Clientes

- `Cliente` es una entidad independiente reutilizable entre pedidos.
- Campos: nombre, teléfono, email (opcional), dirección, localidad, código
  postal, observaciones.
- Búsqueda principal por teléfono para evitar duplicados.

## Auditoría

- Las operaciones administrativas importantes crean un registro en `Auditoria`:
  usuario, acción, entidad, entidadId, datos, resultado y fecha.
- Ejemplos de acciones: `PRODUCTO_CREADO`, `PRODUCTO_EDITADO`,
  `PRODUCTO_DESACTIVADO`, `PRECIO_MODIFICADO`, `STOCK_MODIFICADO`,
  `PEDIDO_CREADO`, `PEDIDO_EDITADO`, `PEDIDO_ESTADO_CAMBIADO`, `PAGO_REGISTRADO`,
  `PROVEEDOR_CREADO`, `PROVEEDOR_EDITADO`, `EMPLEADO_CREADO`.
- La auditoría es de **solo lectura**; no se edita desde la interfaz.

## Idempotencia

Operaciones críticas deben evitar duplicaciones (doble click o reintento):

- descuento de stock (`Pedido.stockDescontado`),
- devolución de stock (`Pedido.stockDevuelto`),
- registro y confirmación de pagos,
- cambios de estado de pedido,
- creación de movimientos.

## Eliminación lógica

- Productos, categorías, proveedores y empleados se desactivan (`activo = false`),
  no se eliminan físicamente.
- Los registros históricos no se rompen al desactivar una entidad.

## Configurabilidad

No se hardcodean datos del comercio. Viven en la base de datos:

- métodos de pago (`MetodoPago`),
- reglas de envío (`ConfiguracionEnvio`),
- categorías (`Categoria`),
- proveedores (`Proveedor`).
