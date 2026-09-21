-- Elimina la entidad Cliente y congela los datos del comprador en Pedido.
-- Los pedidos históricos conservan nombre, teléfono, dirección y localidad
-- tomados del cliente asociado al momento de la migración.

-- 1. Agregar columnas del comprador como NULL para poder backfillear.
ALTER TABLE `Pedido`
    ADD COLUMN `clienteDireccion` VARCHAR(191) NULL,
    ADD COLUMN `clienteLocalidad` VARCHAR(191) NULL,
    ADD COLUMN `clienteNombre` VARCHAR(191) NULL,
    ADD COLUMN `clienteTelefono` VARCHAR(191) NULL;

-- 2. Copiar los datos existentes desde Cliente (con fallback por si hubiera
--    pedidos sin cliente asociado, aunque clienteId era obligatorio).
UPDATE `Pedido` p
LEFT JOIN `Cliente` c ON c.`id` = p.`clienteId`
SET p.`clienteNombre` = COALESCE(c.`nombre`, p.`clienteNombre`, ''),
    p.`clienteTelefono` = COALESCE(c.`telefono`, p.`clienteTelefono`, ''),
    p.`clienteDireccion` = COALESCE(c.`direccion`, p.`clienteDireccion`, p.`direccionEntrega`),
    p.`clienteLocalidad` = COALESCE(c.`localidad`, p.`clienteLocalidad`);

-- 3. Exigir los campos que ahora son obligatorios.
ALTER TABLE `Pedido`
    MODIFY `clienteNombre` VARCHAR(191) NOT NULL,
    MODIFY `clienteTelefono` VARCHAR(191) NOT NULL;

-- 4. Quitar la relación con Cliente.
ALTER TABLE `Pedido` DROP FOREIGN KEY `Pedido_clienteId_fkey`;

DROP INDEX `Pedido_clienteId_idx` ON `Pedido`;

ALTER TABLE `Pedido` DROP COLUMN `clienteId`;

-- 5. Eliminar la tabla Cliente.
DROP TABLE `Cliente`;
