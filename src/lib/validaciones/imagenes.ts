import {
  EXTENSIONES_IMAGEN_PERMITIDAS,
  TAMANO_MAXIMO_IMAGEN_BYTES,
  TIPOS_MIME_IMAGEN_PERMITIDOS,
} from "@/constantes/imagenes";

export type ResultadoValidacionImagen =
  | { valida: true }
  | { valida: false; mensaje: string };

// Validación de seguridad de la imagen de producto. Se ejecuta en el servidor
// antes de subir a Cloudinary; el cliente replica las mismas reglas solo para
// dar mejor experiencia, nunca como única defensa.
export function validarImagenProducto(archivo: File): ResultadoValidacionImagen {
  const tipo = archivo.type.toLowerCase();
  const nombre = archivo.name.toLowerCase();

  const tipoPermitido = (TIPOS_MIME_IMAGEN_PERMITIDOS as readonly string[]).includes(
    tipo,
  );
  const extensionPermitida = EXTENSIONES_IMAGEN_PERMITIDAS.some((extension) =>
    nombre.endsWith(extension),
  );

  if (!tipoPermitido || !extensionPermitida) {
    return {
      valida: false,
      mensaje: "Formato no permitido. Usá JPG, PNG o WEBP.",
    };
  }

  if (archivo.size > TAMANO_MAXIMO_IMAGEN_BYTES) {
    return {
      valida: false,
      mensaje: "La imagen supera el tamaño máximo de 5 MB.",
    };
  }

  return { valida: true };
}
