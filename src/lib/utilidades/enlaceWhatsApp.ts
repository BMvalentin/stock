// Construye un enlace de WhatsApp a partir del número almacenado, dejando solo
// los dígitos que espera la API wa.me.
export function enlaceWhatsApp(numero: string): string {
  const digitos = numero.replace(/\D/g, "");
  return `https://wa.me/${digitos}`;
}
