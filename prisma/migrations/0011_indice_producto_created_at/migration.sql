-- Índice de rendimiento para el orden "más recientes" del listado de productos.
--
-- Migración NO destructiva: solo crea un índice. No elimina tablas, columnas ni
-- filas, y no modifica datos.
--
--   * Producto(createdAt) -> orden del listado de productos por fecha
--     (filtro "orden = recientes" en listarProductos).

CREATE INDEX `Producto_createdAt_idx` ON `Producto`(`createdAt`);
