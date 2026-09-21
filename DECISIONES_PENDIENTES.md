# Decisiones pendientes

Registro de ambigüedades de negocio. Ninguna regla se inventa en silencio:
se documenta acá y se resuelve con el responsable del comercio.

Estado: `RESUELTA` (ya implementada o acordada), `PENDIENTE` (requiere decisión).

## Resueltas

| # | Pregunta | Decisión |
| --- | --- | --- |
| 1 | ¿Precios en tabla separada o columnas? | `PrecioProducto` (fila por producto y método de pago). |
| 2 | ¿Un producto puede tener varios proveedores? | Sí, relación N:M. |
| 3 | ¿Existe proveedor principal? | Sí, `ProductoProveedor.esPrincipal`. |
| 4 | ¿Cliente es entidad independiente? | No. Los datos del comprador se congelan en `Pedido`. |
| 5 | ¿Cómo se determina un bulto? | v1: `1 producto = 1 bulto`. Campo `unidadesPorBulto` para evolucionar. |
| 6 | ¿Cuándo se descuenta stock? | Al pasar el pedido a `CONFIRMADO`. |
| 7 | ¿Qué pasa si se cancela un pedido? | Si ya descontó stock, genera `DEVOLUCION` (una sola vez). |
| 11 | ¿Quién puede cancelar pedidos? | Solo ADMIN. |
| 12 | ¿Qué consulta un empleado? | Dashboard, Productos, Stock, Proveedores, Pedidos (lectura). |
| 13 | ¿Qué datos del comprador ve un empleado? | Nombre, teléfono, dirección y localidad dentro del pedido. |
| 14 | ¿Qué se congela en el pedido? | Nombre y precio unitario del producto, cantidades, subtotal, envío y total. |
| 15 | ¿Qué eventos generan auditoría? | Altas/ediciones/desactivaciones, cambios de precio, movimientos de stock, pedidos, pagos y empleados. |
| — | ¿Cómo levantar PostgreSQL? | Base de datos remota existente vía `DATABASE_URL`. |
| 16 | ¿Medio de pago de proveedores: enum o tabla `MetodoPago`? | Enum propio `MetodoPagoProveedor`. `MetodoPago` representa cobros al cliente y no se reutiliza. |
| 17 | ¿Datos de pago embebidos en `Proveedor` o entidad aparte? | Entidad `CuentaPagoProveedor` (1:N). Permite varias cuentas, principal y activas/inactivas. |
| 18 | ¿El EMPLEADO ve datos bancarios del proveedor? | No. Se oculta la sección completa y el servidor no consulta las cuentas para ese rol (mínimo privilegio). |
| 19 | ¿Qué pasa al desactivar la cuenta principal con otras activas? | Se bloquea hasta designar otra principal. Sin promociones silenciosas. |
| 20 | ¿EFECTIVO exige alias/CBU/CVU? | No. El medio identifica el pago; el resto de los medios exigen al menos un identificador. |
| 21 | ¿Se agrega CUIT al proveedor? | Sí, `Proveedor.cuit` opcional, normalizado a 11 dígitos. |
| 22 | ¿Eliminación de cuentas de pago? | Baja lógica (`activo = false`); se conservan en el historial y pueden reactivarse. |
| 23 | ¿Se muestran CBU/CVU completos? | No. Enmascarados en listados/tarjetas y en auditoría; completos solo en el detalle para ADMIN. |
| 24 | ¿Cómo se vende un producto por unidad o por peso? | `Producto.unidadVenta` (`UNIDAD`/`KILOGRAMO`). El pedido congela `DetallePedido.unidadVenta`; el operador no puede cambiarla. |
| 25 | ¿Qué precisión usan stock y cantidades? | `Decimal(12,3)` (hasta gramos). El dinero sigue en `Decimal(12,2)`. |
| 26 | ¿Cuándo se descuenta el stock de un pedido? | Se valida al crear y se descuenta al pasar a `CONFIRMADO` (regla existente, con banderas de idempotencia). |
| 27 | ¿Cómo se determina el precio de un pedido? | Método de pago obligatorio; el precio sale de `PrecioProducto` (producto + método) y se congela en `DetallePedido.precioUnitario`. |
| 28 | ¿Cómo se guarda la ubicación de entrega? | `Pedido.mapsUrl` (URL de Google Maps validada) y `latitud`/`longitud` opcionales, con snapshot de dirección, localidad y referencia. Sin URL se genera una búsqueda con dirección + localidad. |
| 29 | ¿El empleado es una entidad separada de `User`? | Sí: `Empleado` 1:1 con `User` (`userId @unique`). Aísla los datos salariales; la baja lógica sigue en `User.activo` (fuente única). |
| 30 | ¿Se pueden combinar modalidades de pago? | No. `TipoRemuneracion` es excluyente (`POR_HORA`/`POR_PRODUCCION`). Combinarlas requiere un modelado explícito futuro. |
| 31 | ¿Se persiste el valor hora? | No. Se calcula `pagoJornada / (horasJornada * 60)` en `calcularRemuneracionPorHora`; solo es informativo. |
| 32 | ¿Cómo se representan fecha y hora de asistencia? | `fecha` como `@db.Date` y horas como texto `"HH:mm"`. El cálculo de minutos es aritmética simple y no depende de la zona horaria del servidor. |
| 33 | ¿La salida anticipada genera descuento? | Sí, proporcional por minuto no trabajado, simétrico al retraso y con tope en la jornada completa. |
| 34 | ¿El retraso se redondea? | No. Se descuenta proporcionalmente por minuto (45 min no equivalen a 1 h). |
| 35 | ¿La liquidación se recalcula? | No. Al calcular se congela `total` y `detalle` (JSON) y se vincula cada asistencia/producción incluida para evitar doble pago. |
| 36 | ¿Registrar producción modifica el stock? | No. `EmpleadoProduccion` registra solo la cantidad producida por el empleado. El ingreso de stock, si se quisiera, se haría por el módulo de stock. |
| 37 | ¿El precio de producción reutiliza `PrecioProducto`? | No. Es una tarifa propia (`EmpleadoTarifaProducto`) por empleado y producto; dos empleados pueden tener tarifas distintas para el mismo producto. |
| 38 | ¿La producción guarda el precio histórico? | Sí. Cada `EmpleadoProduccion` congela `precioUnidad` y `total`; cambiar la tarifa no altera registros anteriores. |
| 39 | ¿Una tarifa de producción se elimina? | No. Baja lógica (`activo = false`), se conserva para historial y puede reactivarse. |
| 42 | ¿Cómo se modela la jornada partida? | Columnas planas en `EmpleadoAsistencia`: `horaEntrada`/`horaSalida` (tramo 1) y `horaEntradaTramo2`/`horaSalidaTramo2` (tramo 2). Una única asistencia diaria con hasta dos tramos. |
| 43 | ¿Cómo se identifica al empleado que ficha por QR? | Desde la sesión autenticada (usuario → empleado). El QR solo contiene un token temporal; nunca el id del empleado. |
| 44 | ¿El token del QR es de un solo uso? | No. Es compartido por todos los empleados y temporal (45 s, renovado cada 30 s). La no-reutilización se da por expiración; el doble escaneo por empleado se evita con `ultimoFichajeEn` (60 s). |
| 45 | ¿Cómo se trata una jornada incompleta en la liquidación? | No se paga ni descuenta retraso hasta que el ADMIN la corrija. Solo se liquidan jornadas con todos los tramos configurados cerrados. |
| 46 | ¿La corrección manual puede alterar una liquidación cerrada? | No. Una asistencia incluida en una liquidación `CALCULADA`, `PAGADA` o `CANCELADA` no se edita sin anular antes la liquidación. |
| 47 | ¿Cómo se organizan las rutas internas y el acceso por rol? | Todo el panel vive bajo `/admin/*`. El EMPLEADO accede en solo lectura a dashboard, productos, proveedores, stock, pedidos y su propio fichaje; el resto de `/admin/*` es solo ADMIN (route group `(soloAdmin)` + `requerirAdmin`). Se mantienen redirects temporales desde las rutas anteriores. |
| 48 | ¿Un producto puede venderse por bolsa y suelto por kg a la vez? | Sí, en un único producto. `Producto.permiteVentaSuelta` + `pesoPresentacionKg`; el precio suelto por kg vive en `PrecioProductoSuelto` (independiente del precio de la bolsa). El stock se lleva en kg y la UI muestra la equivalencia en bolsas. La modalidad vendida se congela en `DetallePedido.unidadVenta` y `pesoPresentacionKg`. |

## Pendientes

| # | Pregunta | Recomendación | Impacto |
| --- | --- | --- | --- |
| 8 | ¿Qué pasa si se modifica un pedido después de descontar stock? | Bloquear la edición de líneas una vez `CONFIRMADO`; permitir solo cambios de observaciones/dirección. Alternativa: generar ajustes de stock por diferencia. | Alto |
| 9 | ¿Cuándo un pago pasa de `AVISADO` a `CONFIRMADO`? | Confirmación manual del ADMIN al verificar la acreditación. | Medio |
| 10 | ¿Quién confirma pagos? | Solo ADMIN. | Medio |
| — | ¿Se admite stock negativo configurable? | No por defecto. Si se pide, agregar flag en configuración. | Medio |
| — | ¿Envío por zona? | v1: configuración global. Zonas en una fase posterior. | Medio |
| — | ¿Recargos por método de pago (tarjeta/financiación)? | Hoy el precio por método cubre la diferencia. Definir si se usa recargo porcentual. | Medio |
| — | ¿Precio de costo y márgenes por proveedor? | `ProductoProveedor.costo` existe; definir si se usa para reportes de rentabilidad. | Bajo |
| — | ¿Numeración de pedidos por año o global? | v1: autoincrement global. | Bajo |
| — | ¿Política de retención de auditoría y movimientos? | Sin borrado por ahora. | Bajo |
| — | ¿Devoluciones parciales de pedidos? | v1: cancelación completa del pedido. | Medio |
| — | ¿Notificaciones (email/WhatsApp) automáticas al cliente? | Fuera de alcance en v1. | Bajo |
| — | ¿Roles adicionales? | Solo ADMIN y EMPLEADO. Cualquier otro requiere justificación. | Alto |
| 40 | ¿Se implementan horas extra? | No por ahora. La estructura (minutos y valor minuto) permite agregarlas luego; trabajar de más no paga más automáticamente. | Bajo |
| 41 | ¿Una ausencia justificada se paga? | Hoy no genera pago (igual que la ausente). Definir si corresponde un pago parcial. | Medio |
