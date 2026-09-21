-- Datos/cuentas de pago de proveedores.
-- Un proveedor puede tener varias cuentas; una sola principal entre las activas.
-- No reutiliza la tabla `MetodoPago` (métodos de cobro al cliente): usa un enum
-- propio para el medio de pago al proveedor.
--
-- Migración no destructiva: agrega una columna opcional a Proveedor y una tabla
-- nueva. Los proveedores existentes quedan sin cuentas asociadas.

-- 1. CUIT/CUIL del proveedor, normalizado a 11 dígitos. Opcional.
ALTER TABLE `Proveedor` ADD COLUMN `cuit` VARCHAR(191) NULL;

-- 2. Cuentas de pago del proveedor.
CREATE TABLE `CuentaPagoProveedor` (
    `id`          VARCHAR(191) NOT NULL,
    `proveedorId` VARCHAR(191) NOT NULL,
    `alias`       VARCHAR(191) NULL,
    `cbu`         VARCHAR(191) NULL,
    `cvu`         VARCHAR(191) NULL,
    `titular`     VARCHAR(191) NULL,
    `titularCuit` VARCHAR(191) NULL,
    `banco`       VARCHAR(191) NULL,
    `tipoCuenta`  ENUM('CAJA_AHORRO', 'CUENTA_CORRIENTE', 'CUENTA_VIRTUAL', 'OTRA') NULL,
    `metodoPago`  ENUM('TRANSFERENCIA_BANCARIA', 'TRANSFERENCIA_CVU', 'MERCADO_PAGO', 'EFECTIVO', 'OTRO') NOT NULL,
    `esPrincipal` BOOLEAN NOT NULL DEFAULT false,
    `activo`      BOOLEAN NOT NULL DEFAULT true,
    `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`   DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Índices y relación. onDelete RESTRICT: el proveedor se da de baja lógica,
--    nunca se elimina físicamente, y sus cuentas se conservan en el historial.
CREATE INDEX `CuentaPagoProveedor_proveedorId_idx` ON `CuentaPagoProveedor`(`proveedorId`);

CREATE INDEX `CuentaPagoProveedor_proveedorId_activo_idx` ON `CuentaPagoProveedor`(`proveedorId`, `activo`);

CREATE INDEX `CuentaPagoProveedor_proveedorId_esPrincipal_idx` ON `CuentaPagoProveedor`(`proveedorId`, `esPrincipal`);

ALTER TABLE `CuentaPagoProveedor`
    ADD CONSTRAINT `CuentaPagoProveedor_proveedorId_fkey`
    FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;
