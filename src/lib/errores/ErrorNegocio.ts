// Error de regla de negocio con mensaje apto para mostrar al usuario.
// Las Server Actions lo capturan y lo devuelven como error de formulario.
export class ErrorNegocio extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorNegocio";
  }
}
