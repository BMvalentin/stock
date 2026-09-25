-- Agrega el tipo de precio `PRESENTACION` para representar presentaciones
-- discretas (ej. "10 kg por $5.000", "50 kg por $23.000") que la calculadora
-- combina tomando siempre la presentación más grande que entra, sin convertirlas
-- a un precio por kg ni descomponerlas en combinaciones más baratas.
--
-- No destructiva: agrega un valor al enum al final; los datos existentes
-- (`UNITARIO` y `TOTAL`) no cambian.

ALTER TABLE `ReglaPrecio`
    MODIFY `tipoPrecio` ENUM('UNITARIO', 'TOTAL', 'PRESENTACION') NOT NULL DEFAULT 'UNITARIO';

ALTER TABLE `ReglaPrecioHistorial`
    MODIFY `tipoPrecio` ENUM('UNITARIO', 'TOTAL', 'PRESENTACION') NOT NULL;
