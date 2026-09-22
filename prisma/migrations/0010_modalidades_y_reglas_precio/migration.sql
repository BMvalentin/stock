-- Modalidades de venta y reglas de precio flexibles.
--
-- Reemplaza el modelo plano de precios (`PrecioProducto` / `PrecioProductoSuelto`,
-- una fila por producto y método de pago) por:
--   * `ModalidadVenta`: una o varias formas de vender un mismo producto
--     (ej. bolsa de 15 kg y suelto por kg).
--   * `ReglaPrecio`: escalas por cantidad y promociones, opcionalmente por
--     método de pago, asociadas a una modalidad.
--
-- Migración NO destructiva: crea tablas nuevas, agrega columnas opcionales y
-- backfillea los precios existentes. No elimina ni modifica datos de productos,
-- pedidos, movimientos ni historial. Las tablas `PrecioProducto` y
-- `PrecioProductoSuelto` se conservan como legado; la aplicación deja de usarlas.

-- 1. Unidad canónica del stock del producto. Un producto con venta suelta se
--    lleva en kilogramos (cada modalidad descuenta `cantidad × contenido`).
ALTER TABLE `Producto`
    ADD COLUMN `unidadStock` ENUM('UNIDAD', 'KILOGRAMO') NOT NULL DEFAULT 'UNIDAD';

UPDATE `Producto` SET `unidadStock` = 'KILOGRAMO' WHERE `permiteVentaSuelta` = true;

-- 2. Snapshot del detalle del pedido: nombre de modalidad, contenido en la
--    unidad de stock y desglose de las reglas aplicadas.
ALTER TABLE `DetallePedido`
    ADD COLUMN `modalidadNombre` VARCHAR(191) NULL,
    ADD COLUMN `contenido` DECIMAL(12, 3) NULL,
    ADD COLUMN `desglosePrecio` JSON NULL;

-- 3. Modalidades de venta.
CREATE TABLE `ModalidadVenta` (
    `id`                   VARCHAR(191) NOT NULL,
    `productoId`           VARCHAR(191) NOT NULL,
    `nombre`               VARCHAR(191) NOT NULL,
    `unidadVenta`          ENUM('UNIDAD', 'KILOGRAMO') NOT NULL DEFAULT 'UNIDAD',
    `contenido`            DECIMAL(12, 3) NULL,
    `etiquetaPresentacion` VARCHAR(191) NULL,
    `esBase`               BOOLEAN NOT NULL DEFAULT false,
    `activo`               BOOLEAN NOT NULL DEFAULT true,
    `orden`                INTEGER NOT NULL DEFAULT 0,
    `createdAt`            DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`            DATETIME(3) NOT NULL,

    UNIQUE INDEX `ModalidadVenta_productoId_nombre_key`(`productoId`, `nombre`),
    INDEX `ModalidadVenta_productoId_activo_idx`(`productoId`, `activo`),
    INDEX `ModalidadVenta_productoId_esBase_idx`(`productoId`, `esBase`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Reglas de precio por modalidad.
CREATE TABLE `ReglaPrecio` (
    `id`            VARCHAR(191) NOT NULL,
    `modalidadId`   VARCHAR(191) NOT NULL,
    `metodoPagoId`  VARCHAR(191) NULL,
    `cantidadDesde` DECIMAL(12, 3) NOT NULL DEFAULT 1,
    `cantidadHasta` DECIMAL(12, 3) NULL,
    `tipoPrecio`    ENUM('UNITARIO', 'TOTAL') NOT NULL DEFAULT 'UNITARIO',
    `precio`        DECIMAL(12, 2) NOT NULL,
    `prioridad`     INTEGER NOT NULL DEFAULT 0,
    `activo`        BOOLEAN NOT NULL DEFAULT true,
    `createdAt`     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`     DATETIME(3) NOT NULL,

    INDEX `ReglaPrecio_modalidadId_activo_idx`(`modalidadId`, `activo`),
    INDEX `ReglaPrecio_metodoPagoId_idx`(`metodoPagoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. Historial de cambios de reglas de precio (reemplaza a
--    `PrecioProductoHistorial`, que se conserva como legado).
CREATE TABLE `ReglaPrecioHistorial` (
    `id`             VARCHAR(191) NOT NULL,
    `productoId`     VARCHAR(191) NOT NULL,
    `modalidadId`    VARCHAR(191) NOT NULL,
    `reglaPrecioId`  VARCHAR(191) NULL,
    `metodoPagoId`   VARCHAR(191) NULL,
    `tipoPrecio`     ENUM('UNITARIO', 'TOTAL') NOT NULL,
    `cantidadDesde`  DECIMAL(12, 3) NOT NULL,
    `cantidadHasta`  DECIMAL(12, 3) NULL,
    `precioAnterior` DECIMAL(12, 2) NULL,
    `precioNuevo`    DECIMAL(12, 2) NOT NULL,
    `usuarioId`      VARCHAR(191) NOT NULL,
    `createdAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ReglaPrecioHistorial_productoId_createdAt_idx`(`productoId`, `createdAt`),
    INDEX `ReglaPrecioHistorial_modalidadId_idx`(`modalidadId`),
    INDEX `ReglaPrecioHistorial_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 6. Claves foráneas.
ALTER TABLE `ModalidadVenta`
    ADD CONSTRAINT `ModalidadVenta_productoId_fkey`
        FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ReglaPrecio`
    ADD CONSTRAINT `ReglaPrecio_modalidadId_fkey`
        FOREIGN KEY (`modalidadId`) REFERENCES `ModalidadVenta`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `ReglaPrecio_metodoPagoId_fkey`
        FOREIGN KEY (`metodoPagoId`) REFERENCES `MetodoPago`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `ReglaPrecioHistorial`
    ADD CONSTRAINT `ReglaPrecioHistorial_productoId_fkey`
        FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `ReglaPrecioHistorial_modalidadId_fkey`
        FOREIGN KEY (`modalidadId`) REFERENCES `ModalidadVenta`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `ReglaPrecioHistorial_reglaPrecioId_fkey`
        FOREIGN KEY (`reglaPrecioId`) REFERENCES `ReglaPrecio`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `ReglaPrecioHistorial_metodoPagoId_fkey`
        FOREIGN KEY (`metodoPagoId`) REFERENCES `MetodoPago`(`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT `ReglaPrecioHistorial_usuarioId_fkey`
        FOREIGN KEY (`usuarioId`) REFERENCES `User`(`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. Backfill de modalidades.
--    Productos sin venta suelta: una única modalidad base.
INSERT INTO `ModalidadVenta` (
    `id`, `productoId`, `nombre`, `unidadVenta`, `contenido`,
    `etiquetaPresentacion`, `esBase`, `activo`, `orden`, `createdAt`, `updatedAt`
)
SELECT
    UUID(), p.`id`,
    CASE WHEN p.`unidadVenta` = 'KILOGRAMO' THEN 'Por kg' ELSE 'Unidad' END,
    p.`unidadVenta`, NULL, NULL, true, true, 0,
    CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `Producto` p
WHERE p.`permiteVentaSuelta` = false;

--    Productos con venta suelta: modalidad "Presentación" (base, con contenido)
--    y modalidad "Suelto" por kg.
INSERT INTO `ModalidadVenta` (
    `id`, `productoId`, `nombre`, `unidadVenta`, `contenido`,
    `etiquetaPresentacion`, `esBase`, `activo`, `orden`, `createdAt`, `updatedAt`
)
SELECT
    UUID(), p.`id`, 'Presentación', p.`unidadVenta`, p.`pesoPresentacionKg`,
    CONCAT(CAST(p.`pesoPresentacionKg` AS CHAR), ' kg'), true, true, 0,
    CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `Producto` p
WHERE p.`permiteVentaSuelta` = true;

INSERT INTO `ModalidadVenta` (
    `id`, `productoId`, `nombre`, `unidadVenta`, `contenido`,
    `etiquetaPresentacion`, `esBase`, `activo`, `orden`, `createdAt`, `updatedAt`
)
SELECT
    UUID(), p.`id`, 'Suelto', 'KILOGRAMO', NULL, NULL, false, true, 1,
    CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `Producto` p
WHERE p.`permiteVentaSuelta` = true;

-- 8. Backfill de reglas: los precios planos pasan a ser reglas UNITARIO 1..∞.
--    `PrecioProducto` va a la modalidad base; `PrecioProductoSuelto` a "Suelto".
INSERT INTO `ReglaPrecio` (
    `id`, `modalidadId`, `metodoPagoId`, `cantidadDesde`, `cantidadHasta`,
    `tipoPrecio`, `precio`, `prioridad`, `activo`, `createdAt`, `updatedAt`
)
SELECT
    UUID(), m.`id`, pp.`metodoPagoId`, 1, NULL,
    'UNITARIO', pp.`precio`, 0, pp.`activo`,
    CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `PrecioProducto` pp
JOIN `ModalidadVenta` m
    ON m.`productoId` = pp.`productoId` AND m.`esBase` = true;

INSERT INTO `ReglaPrecio` (
    `id`, `modalidadId`, `metodoPagoId`, `cantidadDesde`, `cantidadHasta`,
    `tipoPrecio`, `precio`, `prioridad`, `activo`, `createdAt`, `updatedAt`
)
SELECT
    UUID(), m.`id`, ps.`metodoPagoId`, 1, NULL,
    'UNITARIO', ps.`precio`, 0, ps.`activo`,
    CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `PrecioProductoSuelto` ps
JOIN `ModalidadVenta` m
    ON m.`productoId` = ps.`productoId` AND m.`nombre` = 'Suelto';
