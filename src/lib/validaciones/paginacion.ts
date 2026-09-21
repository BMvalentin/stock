import { z } from "zod";
import {
  PAGINA_POR_DEFECTO,
  TAMANOS_PAGINA,
  TAMANO_PAGINA_MAX,
} from "@/constantes/paginacion";

// Los searchParams de Next llegan como string | string[] | undefined. Se toma
// el primer valor y se coacciona a entero. Los valores inválidos caen al
// default en lugar de romper la página.
const primerValor = (valor: unknown) =>
  Array.isArray(valor) ? valor[0] : valor;

const tamanosPermitidos = TAMANOS_PAGINA as readonly number[];

export const esquemaPaginacion = z.object({
  pagina: z.preprocess(
    primerValor,
    z.coerce.number().int().min(1).catch(1),
  ),
  porPagina: z.preprocess(
    primerValor,
    z.coerce
      .number()
      .int()
      .min(1)
      .max(TAMANO_PAGINA_MAX)
      .refine((valor) => tamanosPermitidos.includes(valor))
      .catch(PAGINA_POR_DEFECTO),
  ),
});

export type ParametrosPaginacion = z.infer<typeof esquemaPaginacion>;
