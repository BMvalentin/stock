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
| 4 | ¿Cliente es entidad independiente? | Sí, `Cliente` reutilizable. |
| 5 | ¿Cómo se determina un bulto? | v1: `1 producto = 1 bulto`. Campo `unidadesPorBulto` para evolucionar. |
| 6 | ¿Cuándo se descuenta stock? | Al pasar el pedido a `CONFIRMADO`. |
| 7 | ¿Qué pasa si se cancela un pedido? | Si ya descontó stock, genera `DEVOLUCION` (una sola vez). |
| 11 | ¿Quién puede cancelar pedidos? | Solo ADMIN. |
| 12 | ¿Qué consulta un empleado? | Dashboard, Productos, Stock, Proveedores, Pedidos (lectura). |
| 13 | ¿Qué datos de clientes ve un empleado? | Nombre, teléfono, dirección y localidad. |
| 14 | ¿Qué se congela en el pedido? | Nombre y precio unitario del producto, cantidades, subtotal, envío y total. |
| 15 | ¿Qué eventos generan auditoría? | Altas/ediciones/desactivaciones, cambios de precio, movimientos de stock, pedidos, pagos y empleados. |
| — | ¿Cómo levantar PostgreSQL? | Base de datos remota existente vía `DATABASE_URL`. |

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
