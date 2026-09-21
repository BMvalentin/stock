-- Módulo de remuneración de empleados: modalidad (por hora / por producción),
-- jornada, asistencia, tarifas por producto, producción y liquidaciones.
--
-- Migración no destructiva: crea tablas nuevas y backfillea un perfil `Empleado`
-- para cada `User` existente con valores por defecto. No elimina datos ni
-- modifica tablas existentes.

-- 1. Perfil laboral 1:1 con User. No duplica el sistema de usuarios: la baja
--    lógica sigue siendo `User.activo`.
CREATE TABLE `Empleado` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tipoRemuneracion` ENUM('POR_HORA', 'POR_PRODUCCION') NOT NULL DEFAULT 'POR_HORA',
    `horasJornada` DECIMAL(5, 2) NOT NULL DEFAULT 8,
    `pagoJornada` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `horaEntradaEsperada` VARCHAR(191) NOT NULL DEFAULT '08:00',
    `horaSalidaEsperada` VARCHAR(191) NOT NULL DEFAULT '16:00',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Empleado_userId_key`(`userId`),
    INDEX `Empleado_tipoRemuneracion_idx`(`tipoRemuneracion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Jornada registrada. `fecha` date-only y horas "HH:mm" para no depender de
--    la zona horaria del servidor.
CREATE TABLE `EmpleadoAsistencia` (
    `id` VARCHAR(191) NOT NULL,
    `empleadoId` VARCHAR(191) NOT NULL,
    `fecha` DATE NOT NULL,
    `horaEntrada` VARCHAR(191) NULL,
    `horaSalida` VARCHAR(191) NULL,
    `minutosTrabajados` INTEGER NULL,
    `minutosRetraso` INTEGER NULL,
    `estado` ENUM('PRESENTE', 'AUSENTE', 'JUSTIFICADO') NOT NULL DEFAULT 'PRESENTE',
    `observacion` VARCHAR(191) NULL,
    `liquidacionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `EmpleadoAsistencia_empleadoId_fecha_key`(`empleadoId`, `fecha`),
    INDEX `EmpleadoAsistencia_empleadoId_fecha_idx`(`empleadoId`, `fecha`),
    INDEX `EmpleadoAsistencia_liquidacionId_idx`(`liquidacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Tarifa por unidad producida (independiente del precio de venta).
CREATE TABLE `EmpleadoTarifaProducto` (
    `id` VARCHAR(191) NOT NULL,
    `empleadoId` VARCHAR(191) NOT NULL,
    `productoId` VARCHAR(191) NOT NULL,
    `precioUnidad` DECIMAL(12, 2) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `EmpleadoTarifaProducto_empleadoId_productoId_key`(`empleadoId`, `productoId`),
    INDEX `EmpleadoTarifaProducto_empleadoId_productoId_idx`(`empleadoId`, `productoId`),
    INDEX `EmpleadoTarifaProducto_productoId_idx`(`productoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Producción registrada con snapshot de precio y total.
CREATE TABLE `EmpleadoProduccion` (
    `id` VARCHAR(191) NOT NULL,
    `empleadoId` VARCHAR(191) NOT NULL,
    `productoId` VARCHAR(191) NOT NULL,
    `fecha` DATE NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precioUnidad` DECIMAL(12, 2) NOT NULL,
    `total` DECIMAL(12, 2) NOT NULL,
    `liquidacionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `EmpleadoProduccion_empleadoId_fecha_idx`(`empleadoId`, `fecha`),
    INDEX `EmpleadoProduccion_productoId_idx`(`productoId`),
    INDEX `EmpleadoProduccion_liquidacionId_idx`(`liquidacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. Liquidación de un período con total y detalle congelados.
CREATE TABLE `EmpleadoLiquidacion` (
    `id` VARCHAR(191) NOT NULL,
    `empleadoId` VARCHAR(191) NOT NULL,
    `desde` DATE NOT NULL,
    `hasta` DATE NOT NULL,
    `tipoRemuneracion` ENUM('POR_HORA', 'POR_PRODUCCION') NOT NULL,
    `total` DECIMAL(12, 2) NOT NULL,
    `estado` ENUM('ABIERTA', 'CALCULADA', 'PAGADA', 'CANCELADA') NOT NULL DEFAULT 'ABIERTA',
    `detalle` JSON NULL,
    `calculadaEn` DATETIME(3) NULL,
    `pagadaEn` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `EmpleadoLiquidacion_empleadoId_desde_hasta_key`(`empleadoId`, `desde`, `hasta`),
    INDEX `EmpleadoLiquidacion_empleadoId_desde_idx`(`empleadoId`, `desde`),
    INDEX `EmpleadoLiquidacion_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 6. Claves foráneas.
ALTER TABLE `Empleado`
    ADD CONSTRAINT `Empleado_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `EmpleadoAsistencia`
    ADD CONSTRAINT `EmpleadoAsistencia_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `Empleado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `EmpleadoAsistencia_liquidacionId_fkey` FOREIGN KEY (`liquidacionId`) REFERENCES `EmpleadoLiquidacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `EmpleadoTarifaProducto`
    ADD CONSTRAINT `EmpleadoTarifaProducto_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `Empleado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `EmpleadoTarifaProducto_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `EmpleadoProduccion`
    ADD CONSTRAINT `EmpleadoProduccion_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `Empleado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `EmpleadoProduccion_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT `EmpleadoProduccion_liquidacionId_fkey` FOREIGN KEY (`liquidacionId`) REFERENCES `EmpleadoLiquidacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `EmpleadoLiquidacion`
    ADD CONSTRAINT `EmpleadoLiquidacion_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `Empleado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. Backfill: un perfil por cada usuario existente. `UUID()` genera un id
--    válido para las filas históricas (Prisma usa cuid en las nuevas).
INSERT INTO `Empleado` (
    `id`, `userId`, `tipoRemuneracion`, `horasJornada`, `pagoJornada`,
    `horaEntradaEsperada`, `horaSalidaEsperada`, `createdAt`, `updatedAt`
)
SELECT
    UUID(), `id`, 'POR_HORA', 8, 0,
    '08:00', '16:00', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `User`;
