// Estado compartido por los formularios y sus Server Actions.
export type EstadoFormulario = {
  exito?: boolean;
  mensaje?: string;
  error?: string;
  errores?: Record<string, string[]>;
  redirigir?: string;
};

export const ESTADO_FORMULARIO_INICIAL: EstadoFormulario = {};
