import { z } from "zod";
import { esquemaMontoPositivo } from "@/lib/validaciones/montos";

// Tarifa que se paga a un empleado por unidad producida de un producto.
export const esquemaTarifaProducto = z.object({
  empleadoId: z.string().min(1, "Empleado inválido"),
  productoId: z.string().min(1, "Seleccioná un producto"),
  precioUnidad: esquemaMontoPositivo,
});
