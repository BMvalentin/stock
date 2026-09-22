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
| Reportes | completo | sin acceso |
| Empleados | crear/desactivar | sin acceso |
| Configuración | completo | sin acceso |
| Auditoría | consultar | sin acceso |

Reglas:

- La autorización se controla **siempre en el servidor** (`requerirSesion`,
  `requerirAdmin`). Ocultar botones no autoriza.
- El EMPLEADO tiene acceso de **solo lectura** a Dashboard, Productos, Stock,
  Proveedores y Pedidos.
- Dentro de un pedido, el EMPLEADO ve solo `nombre`, `teléfono`, `dirección` y
  `localidad` del comprador.

## Stock

- El stock **no se modifica sin generar un movimiento**. Toda variación crea un
  `MovimientoStock`.
- Tipos de movimiento: `INGRESO`, `EGRESO`, `AJUSTE_POSITIVO`, `AJUSTE_NEGATIVO`,
  `VENTA`, `DEVOLUCION`.
- Cada movimiento registra: producto, tipo, cantidad, stock anterior, stock
  posterior, usuario, motivo, pedido opcional y fecha.
- `stockActual` nunca puede quedar por debajo de 0. No se admite `stock = -1`.
- `stockActual`, `stockMinimo`, las cantidades de `MovimientoStock` y las
  cantidades de pedido usan `Decimal(12,3)` para admitir venta por peso (kg).
- `Producto.unidadStock` define la unidad del stock (kg si hay una modalidad por
  kg). Cada línea descuenta `cantidad × (modalidad.contenido ?? 1)` en esa
  unidad; la interfaz muestra la equivalencia en presentaciones (ej.
  `150 kg · 10 bolsas`). La venta suelta no crea un stock separado: comparte el
  stock del producto.
- El descuento por venta usa una actualización condicional
  (`stockActual >= cantidad`): dos pedidos concurrentes no pueden dejar stock
  negativo.
- Operaciones de stock y dinero se ejecutan en `prisma.$transaction`.
- Las operaciones son **idempotentes** (ver "Idempotencia").

## Precios

- Los precios se modelan como **modalidades de venta** (`ModalidadVenta`) con
  **reglas de precio** (`ReglaPrecio`). No se hardcodean columnas como
  `precioMayorista`, `precioSuelto` o `precio2Kg`.
- Un producto puede tener **una o varias modalidades** (ej. "Bolsa 15 kg" y
  "Suelto"). Cada modalidad define la unidad de venta (`UNIDAD`/`KILOGRAMO`) y,
  opcionalmente, `contenido` (stock que consume una unidad) y una etiqueta de
  presentación. Una modalidad se marca `esBase` para preseleccionarla.
- `Producto.unidadStock` es la unidad canónica del stock: `KILOGRAMO` si alguna
  modalidad es por kg; si no, `UNIDAD`.
- Una **regla de precio** pertenece a una modalidad y define:
  - `cantidadDesde`/`cantidadHasta` (rango; `null` = sin límite);
  - `tipoPrecio`: `UNITARIO` (precio × cantidad) o `TOTAL` (conjunto de
    `cantidadDesde` unidades por un precio total = promoción);
  - `precio`;
  - `metodoPagoId` opcional (`null` = aplica a cualquier método de pago).
- **Escalas por cantidad**: reglas `UNITARIO` con rango (ej. 1-9 $2.000,
  10-19 $1.800, 20+ $1.600).
- **Promociones**: reglas `TOTAL` (ej. "2 kg por $5.000"). Se aplican en
  **múltiplos completos** y el resto se cobra al precio unitario de la escala.
  El sistema elige la combinación más barata (sin ambigüedad).
- **Método de pago**: si existen reglas específicas del método elegido, se usan;
  si no cubren la cantidad, se cae a las genéricas.
- **Listas de precios / tipo de cliente**: no implementadas. El precio por
  cantidad cubre el caso mayorista. El modelo admite agregar un `listaPreciosId`
  a `ReglaPrecio` en el futuro sin rediseñar el motor.
- Cambiar el precio de una regla registra `ReglaPrecioHistorial` y auditoría
  `PRECIO_MODIFICADO`.
- Al crear un pedido el precio se **congela** en `DetallePedido.precioUnitario`,
  `DetallePedido.subtotal` y `DetallePedido.desglosePrecio`. Un pedido histórico
  nunca se recalcula.
- Las tablas `PrecioProducto`/`PrecioProductoSuelto` quedan como **legado** (la
  app ya no las usa). La migración `0010` copió sus datos a modalidades y reglas.


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

### Creación y cálculo

- Solo un ADMIN crea pedidos (el EMPLEADO tiene lectura).
- El cliente no define precios, subtotales ni total: envía producto y cantidad.
  El servidor resuelve el precio de `PrecioProducto` según el método de pago
  elegido (obligatorio) y calcula subtotales, envío y total.
- Cada línea congela `nombreProducto`, `modalidadNombre`, `unidadVenta`,
  `contenido`, `precioUnitario`, `cantidad`, `subtotal` y `desglosePrecio` en
  `DetallePedido`.
- Cantidades: por unidad deben ser enteras; por kilogramo admiten hasta 3
  decimales. Se rechazan cantidades cero o negativas.
- No se repite una modalidad: si se agrega dos veces el mismo producto y
  modalidad, se suma la cantidad. Un producto puede aparecer a la vez como bolsa
  y como suelto (modalidades distintas).
- El envío se calcula con el servicio de envío (nunca en el componente). El
  retiro en el local no tiene costo.
- Al crear se valida el stock disponible. El descuento real ocurre al confirmar
  (ver "Stock y pedidos").

### Entrega y ubicación

- El pedido guarda un snapshot de entrega: dirección, localidad, referencia
  opcional, `mapsUrl` y coordenadas opcionales.
- `mapsUrl` debe ser una URL HTTPS de Google Maps; se rechazan esquemas
  peligrosos (`javascript:`, etc.).
- El botón "Abrir ubicación" usa `mapsUrl`; si no existe, genera una búsqueda
  con dirección + localidad. No se inventan coordenadas.

### Stock y pedidos

- El stock se descuenta **al pasar el pedido a `CONFIRMADO`** (movimiento `VENTA`).
  La cantidad descontada es la de stock de cada línea (`cantidad × contenido`, en
  `unidadStock`; `cantidad` directa si la modalidad no tiene contenido).
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
- Los bultos se calculan con el `contenido` de la modalidad base: una bolsa
  cuenta 1 bulto y una venta suelta la fracción de bolsa que consume.
- El costo de envío se congela en `Pedido.costoEnvio` al crear/editar el pedido.

## Proveedores

- Relación N:M entre `Producto` y `Proveedor` mediante `ProductoProveedor`.
- Un producto puede tener varios proveedores y uno marcado como principal
  (`esPrincipal`).
- Contacto directo: llamada (`telefono`), WhatsApp (`whatsapp`) y email.
- El enlace de WhatsApp se genera a partir del número almacenado.
- No existe chat interno con proveedores.
- `Proveedor.cuit` (opcional) se normaliza a 11 dígitos.

### Datos/cuentas de pago del proveedor

- Relación `Proveedor 1 — N CuentaPagoProveedor`. Un proveedor puede existir
  sin cuentas de pago; no se bloquea su alta, edición ni la asociación de
  productos.
- El medio de pago usa el enum `MetodoPagoProveedor`
  (`TRANSFERENCIA_BANCARIA`, `TRANSFERENCIA_CVU`, `MERCADO_PAGO`, `EFECTIVO`,
  `OTRO`). Es independiente de la tabla `MetodoPago` (cobros al cliente).
- `TipoCuentaProveedor`: `CAJA_AHORRO`, `CUENTA_CORRIENTE`, `CUENTA_VIRTUAL`,
  `OTRA` (opcional).
- Debe existir al menos un identificador de pago: `alias`, `cbu` o `cvu`.
  Excepción: `EFECTIVO`, que no requiere datos bancarios.
- `CBU` y `CVU` se guardan solo con dígitos (22). `titularCuit` se guarda con
  11 dígitos. `alias`, `titular` y `banco` se recortan y colapsan espacios.
- Cuenta principal: `esPrincipal`. Un proveedor tiene como máximo **una**
  cuenta principal activa; se garantiza en el servidor con una transacción que
  quita la marca de las demás antes de marcarla.
- Una cuenta inactiva (`activo = false`) no puede ser principal. Desactivar una
  cuenta principal con otras cuentas activas se bloquea hasta designar otra
  principal.
- Baja lógica: las cuentas no se eliminan físicamente; se desactivan y pueden
  reactivarse, conservando el historial.
- Datos sensibles: `CBU`/`CVU` se muestran enmascarados en listados y tarjetas
  resumidas, y **nunca** completos en la auditoría. El EMPLEADO no accede a la
  sección de datos de pago.
- Auditoría: `CUENTA_PAGO_PROVEEDOR_CREADA`, `..._EDITADA`,
  `..._PRINCIPAL_CAMBIADA`, `..._ACTIVADA`, `..._DESACTIVADA`.

## Comprador en pedidos

- No existe un módulo independiente de clientes.
- Los datos del comprador se congelan en `Pedido`: `clienteNombre`,
  `clienteTelefono`, `clienteDireccion` y `clienteLocalidad`.
- La entrega también se congela: `direccionEntrega`, `referenciaEntrega`,
  `mapsUrl`, `latitud` y `longitud`. Si el cliente cambia de domicilio, el
  pedido histórico no se modifica.
- Se muestran únicamente como parte del pedido; no hay historial ni perfil de
  clientes.

## Remuneración de empleados

- Cada `User` tiene un perfil laboral `Empleado` 1:1. La baja lógica sigue
  siendo `User.activo`; no hay un segundo sistema de usuarios.
- `TipoRemuneracion` es excluyente: `POR_HORA` o `POR_PRODUCCION`. No se
  mezclan las fórmulas. Combinar ambas requiere un modelado explícito futuro.
- **Por hora:** se configuran `horasJornada`, `pagoJornada`,
  `horaEntradaEsperada` y `horaSalidaEsperada` (tramo 1). Opcionalmente
  `horaEntradaTramo2Esperada` y `horaSalidaTramo2Esperada` (tramo 2): sin ellas
  la jornada es continua; con ambas, partida. El valor minuto es
  `pagoJornada / (horasJornada * 60)` y no se persiste.
- **Asistencia:** `fecha` (`@db.Date`) y horas `"HH:mm"`. Una única asistencia
  diaria con hasta dos tramos. Se guardan minutos trabajados y de retraso
  totales y por tramo, calculados en el momento. Estados: `PRESENTE`,
  `AUSENTE`, `JUSTIFICADO`. Origen: `QR` o `MANUAL_ADMIN`. Una ausencia no
  genera pago.
- **Fichaje por QR:** el empleado escanea desde su teléfono un token temporal
  generado en la pantalla `/asistencia/qr`. La identidad surge de la sesión
  autenticada; la fecha y la hora las fija el servidor en
  `America/Argentina/Buenos_Aires`. La secuencia es Entrada 1 → Salida 1 →
  Entrada 2 → Salida 2. Un quinto fichaje se rechaza; un doble escaneo dentro de
  60 s no duplica. El ADMIN conserva la carga y corrección manuales.
- **Cálculo por hora:** el pago de cada jornada es proporcional a los minutos
  trabajados (`valorMinuto × minutos`), con tope en la jornada completa. El
  retraso y la salida anticipada se descuentan proporcionalmente por minuto
  (45 min no se redondean a 1 h). El retraso se calcula por tramo y se suma. Una
  jornada incompleta no se paga ni descuenta retraso hasta su corrección. No hay
  horas extra automáticas.
- **Por producción:** `EmpleadoTarifaProducto` define el precio por unidad de
  cada empleado y producto. Es independiente de `PrecioProducto` (precio de
  venta). La tarifa tiene baja lógica (`activo = false`) y puede reactivarse.
- **Registro de producción:** el precio se toma de la tarifa activa y se
  congela en `EmpleadoProduccion` (`precioUnidad`, `total`). La cantidad es un
  entero positivo. Registrar producción **no** modifica el stock.
- **Liquidación (`EmpleadoLiquidacion`):** representa cuánto corresponde pagar
  por un período. Estados: `ABIERTA`, `CALCULADA`, `PAGADA`, `CANCELADA`. Al
  calcular se congela el `total` y el `detalle` (JSON) y se vincula cada
  asistencia/producción incluida. Una liquidación cerrada no se recalcula;
  corregirla requiere anularla (lo que libera los registros). No implementa
  pago bancario.
- **Cambio de modalidad o tarifa:** no altera registros históricos. Las
  asistencias, producciones y liquidaciones conservan su modalidad, tarifa e
  importes.
- **Seguridad:** los datos de remuneración son sensibles. Solo `ADMIN`
  configura remuneraciones, tarifas, asistencia, producción y liquidaciones.
  El `EMPLEADO` puede fichar y consultar su asistencia, pero no modificar
  asistencia histórica, horarios, remuneración ni liquidaciones. Toda acción
  valida autenticación, rol y autorización en el servidor.
- **Auditoría:** `EMPLEADO_REMUNERACION_ACTUALIZADA`,
  `TARIFA_PRODUCCION_CREADA/EDITADA/ACTIVADA/DESACTIVADA`,
  `PRODUCCION_REGISTRADA/EDITADA/ANULADA`,
  `ASISTENCIA_REGISTRADA/EDITADA`, `ASISTENCIA_FICHAJE_QR`,
  `LIQUIDACION_CALCULADA/PAGADA/CANCELADA`. El origen (`QR` o `MANUAL_ADMIN`)
  queda registrado en los datos de auditoría.

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
