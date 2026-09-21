-- Código de barras comercial opcional e independiente del SKU.
-- TiDB/MySQL permite múltiples NULL en un índice único, así que los productos
-- sin código no se bloquean entre sí.
ALTER TABLE `Producto` ADD COLUMN `barcode` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Producto_barcode_key` ON `Producto`(`barcode`);
