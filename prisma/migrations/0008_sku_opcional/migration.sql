-- SKU opcional. TiDB/MySQL permite múltiples NULL en un índice único, así que
-- los productos sin SKU no se bloquean entre sí. El índice único se conserva
-- para que los SKU ingresados sigan siendo únicos.
ALTER TABLE `Producto` MODIFY `sku` VARCHAR(191) NULL;
