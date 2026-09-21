-- Índices de rendimiento para listados y filtros.
--
-- Migración NO destructiva: solo crea índices. No elimina tablas, columnas ni
-- filas, y no modifica datos. Cada índice responde a consultas reales del panel:
--
--   * User(activo, rol, name)                    -> listado de empleados
--   * Categoria(activo, nombre)                  -> listado de categorías
--   * Proveedor(activo, nombre)                  -> listado de proveedores
--   * MovimientoStock(tipo, createdAt)           -> movimientos filtrados por tipo
--   * MovimientoStock(usuarioId, createdAt)      -> movimientos filtrados por usuario
--   * Pedido(estado, createdAt)                  -> pedidos por estado, más recientes
--   * Pedido(estadoPago, createdAt)              -> pedidos por estado de pago
--   * Auditoria(usuarioId, createdAt)            -> auditoría por usuario
--   * Auditoria(accion, createdAt)               -> auditoría por acción
--   * Auditoria(entidad, createdAt)              -> auditoría por entidad
--   * EmpleadoLiquidacion(empleadoId, estado)    -> liquidaciones de un empleado por estado
--
-- TiDB no admite crear un índice sobre una columna agregada en el mismo ALTER,
-- pero estos índices usan columnas existentes, por lo que una sentencia por
-- índice es segura.

CREATE INDEX `User_activo_rol_name_idx` ON `User`(`activo`, `rol`, `name`);
CREATE INDEX `Categoria_activo_nombre_idx` ON `Categoria`(`activo`, `nombre`);
CREATE INDEX `Proveedor_activo_nombre_idx` ON `Proveedor`(`activo`, `nombre`);
CREATE INDEX `MovimientoStock_tipo_createdAt_idx` ON `MovimientoStock`(`tipo`, `createdAt`);
CREATE INDEX `MovimientoStock_usuarioId_createdAt_idx` ON `MovimientoStock`(`usuarioId`, `createdAt`);
CREATE INDEX `Pedido_estado_createdAt_idx` ON `Pedido`(`estado`, `createdAt`);
CREATE INDEX `Pedido_estadoPago_createdAt_idx` ON `Pedido`(`estadoPago`, `createdAt`);
CREATE INDEX `Auditoria_usuarioId_createdAt_idx` ON `Auditoria`(`usuarioId`, `createdAt`);
CREATE INDEX `Auditoria_accion_createdAt_idx` ON `Auditoria`(`accion`, `createdAt`);
CREATE INDEX `Auditoria_entidad_createdAt_idx` ON `Auditoria`(`entidad`, `createdAt`);
CREATE INDEX `EmpleadoLiquidacion_empleadoId_estado_idx` ON `EmpleadoLiquidacion`(`empleadoId`, `estado`);
