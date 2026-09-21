-- Módulo de pedidos: modalidad de venta (unidad/kg), precisión decimal y datos
-- de entrega con ubicación.
--
-- Migración no destructiva: agrega columnas y amplía el tipo de columnas
-- existentes de INT a DECIMAL(12,3). Los valores enteros se conservan sin
-- pérdida (ej. 20 pasa a 20.000). No se eliminan datos ni tablas.

-- 1. Modalidad de venta del producto. Default UNIDAD para los productos
--    existentes; el operador no puede cambiarla desde el pedido.
ALTER TABLE `Producto`
    ADD COLUMN `unidadVenta` ENUM('UNIDAD', 'KILOGRAMO') NOT NULL DEFAULT 'UNIDAD';

-- 2. Stock con precisión decimal para admitir venta por peso (kg).
ALTER TABLE `Producto`
    MODIFY `stockActual` DECIMAL(12, 3) NOT NULL DEFAULT 0,
    MODIFY `stockMinimo` DECIMAL(12, 3) NOT NULL DEFAULT 0;

-- 3. Movimientos de stock con la misma precisión que el stock.
ALTER TABLE `MovimientoStock`
    MODIFY `cantidad` DECIMAL(12, 3) NOT NULL,
    MODIFY `stockAnterior` DECIMAL(12, 3) NOT NULL,
    MODIFY `stockPosterior` DECIMAL(12, 3) NOT NULL;

-- 4. Cantidad del detalle con precisión decimal y snapshot de la modalidad.
--    Se backfillea con UNIDAD y luego se quita el default para que Prisma
--    exija el valor explícito en cada nuevo detalle.
ALTER TABLE `DetallePedido`
    MODIFY `cantidad` DECIMAL(12, 3) NOT NULL,
    ADD COLUMN `unidadVenta` ENUM('UNIDAD', 'KILOGRAMO') NOT NULL DEFAULT 'UNIDAD';

ALTER TABLE `DetallePedido`
    ALTER COLUMN `unidadVenta` DROP DEFAULT;

-- 5. Snapshot de entrega del pedido. `mapsUrl` guarda la ubicación cargada por
--    el operador; latitud/longitud son opcionales y no la reemplazan.
ALTER TABLE `Pedido`
    ADD COLUMN `referenciaEntrega` VARCHAR(191) NULL,
    ADD COLUMN `mapsUrl` VARCHAR(191) NULL,
    ADD COLUMN `latitud` DECIMAL(10, 7) NULL,
    ADD COLUMN `longitud` DECIMAL(10, 7) NULL;
