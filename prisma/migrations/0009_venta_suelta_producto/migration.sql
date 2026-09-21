-- Venta suelta por kilogramo. Un mismo producto empaquetado puede venderse por
-- bolsa/bulto y, opcionalmente, suelto por kg, con precios independientes.
--
-- Migración no destructiva: agrega columnas opcionales o con default y una
-- tabla nueva. Los productos existentes quedan con `permiteVentaSuelta = false`
-- y conservan exactamente su precio, su stock y su modalidad.

-- 1. Producto: bandera de venta suelta y peso de la presentación en kg.
--    `pesoPresentacionKg` es el peso de la bolsa (ej. 15 kg). No reemplaza a
--    `unidadesPorBulto`, que es un conteo entero usado por el envío POR_BULTO.
ALTER TABLE `Producto`
    ADD COLUMN `permiteVentaSuelta` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `pesoPresentacionKg` DECIMAL(12, 3) NULL;

-- 2. Precios de venta suelta: uno por producto y método de pago, igual que
--    `PrecioProducto`. Es un precio propio; nunca se deriva del de la bolsa.
CREATE TABLE `PrecioProductoSuelto` (
    `id`           VARCHAR(191) NOT NULL,
    `productoId`   VARCHAR(191) NOT NULL,
    `metodoPagoId` VARCHAR(191) NOT NULL,
    `precio`       DECIMAL(12, 2) NOT NULL,
    `activo`       BOOLEAN NOT NULL DEFAULT true,
    `createdAt`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`    DATETIME(3) NOT NULL,

    UNIQUE INDEX `PrecioProductoSuelto_productoId_metodoPagoId_key`(`productoId`, `metodoPagoId`),
    INDEX `PrecioProductoSuelto_metodoPagoId_idx`(`metodoPagoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `PrecioProductoSuelto`
    ADD CONSTRAINT `PrecioProductoSuelto_productoId_fkey`
        FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `PrecioProductoSuelto_metodoPagoId_fkey`
        FOREIGN KEY (`metodoPagoId`) REFERENCES `MetodoPago`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. Detalle del pedido: snapshot del peso de la presentación vendida. En una
--    línea de bolsa indica cuántos kg de stock descuenta cada unidad.
ALTER TABLE `DetallePedido`
    ADD COLUMN `pesoPresentacionKg` DECIMAL(12, 3) NULL;

-- 4. Historial de precios: distinguir el precio suelto del de la presentación.
ALTER TABLE `PrecioProductoHistorial`
    ADD COLUMN `esSuelto` BOOLEAN NOT NULL DEFAULT false;
