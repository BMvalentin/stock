-- Fichaje por QR y jornada partida.
--
-- Migración no destructiva: solo agrega columnas y una tabla nueva, y hace un
-- backfill de datos derivados. No elimina tablas ni columnas ni borra filas.

-- 1. Horario esperado del tramo 2 (opcional) en el perfil del empleado. El
--    tramo 1 sigue en `horaEntradaEsperada`/`horaSalidaEsperada`.
ALTER TABLE `Empleado`
    ADD COLUMN `horaEntradaTramo2Esperada` VARCHAR(191) NULL,
    ADD COLUMN `horaSalidaTramo2Esperada` VARCHAR(191) NULL;

-- 2. Tramos y origen en la asistencia. `horaEntrada`/`horaSalida` siguen siendo
--    el tramo 1; `minutosTrabajados`/`minutosRetraso` siguen siendo los totales
--    del día. `ultimoFichajeEn` se usa para evitar dobles escaneos.
ALTER TABLE `EmpleadoAsistencia`
    ADD COLUMN `horaEntradaTramo2` VARCHAR(191) NULL,
    ADD COLUMN `horaSalidaTramo2` VARCHAR(191) NULL,
    ADD COLUMN `minutosRetrasoTramo1` INTEGER NULL,
    ADD COLUMN `minutosRetrasoTramo2` INTEGER NULL,
    ADD COLUMN `origen` ENUM('QR', 'MANUAL_ADMIN') NOT NULL DEFAULT 'MANUAL_ADMIN',
    ADD COLUMN `ultimoFichajeEn` DATETIME(3) NULL;

-- TiDB no admite crear un índice sobre una columna agregada en el mismo ALTER.
ALTER TABLE `EmpleadoAsistencia`
    ADD INDEX `EmpleadoAsistencia_ultimoFichajeEn_idx`(`ultimoFichajeEn`);

-- 3. Backfill: en el modelo anterior todo el retraso correspondía al tramo 1.
UPDATE `EmpleadoAsistencia`
    SET `minutosRetrasoTramo1` = `minutosRetraso`
    WHERE `minutosRetraso` IS NOT NULL;

-- 4. Token temporal de fichaje por QR. Solo se guarda el hash del token.
CREATE TABLE `TokenFichajeQR` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiraEn` DATETIME(3) NOT NULL,
    `creadoPorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `TokenFichajeQR_tokenHash_key`(`tokenHash`),
    INDEX `TokenFichajeQR_expiraEn_idx`(`expiraEn`),
    INDEX `TokenFichajeQR_creadoPorId_idx`(`creadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `TokenFichajeQR`
    ADD CONSTRAINT `TokenFichajeQR_creadoPorId_fkey` FOREIGN KEY (`creadoPorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
