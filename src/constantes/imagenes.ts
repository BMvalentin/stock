// Configuración centralizada de las imágenes de producto en Cloudinary.
// El nombre de la carpeta no debe repetirse disperso por el código.

export const CARPETA_IMAGENES_PRODUCTOS = "productos";

export const TIPOS_MIME_IMAGEN_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const EXTENSIONES_IMAGEN_PERMITIDAS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
] as const;

export const TAMANO_MAXIMO_IMAGEN_BYTES = 5 * 1024 * 1024;

// La imagen almacenada se acota en dimensiones para no guardar archivos
// innecesariamente grandes. Las transformaciones de entrega se generan al
// mostrar (ver `urlImagenCloudinary`).
export const ANCHO_MAXIMO_IMAGEN_ALMACENADA = 1600;

export const TAMANO_MINIATURA_PRODUCTO = { ancho: 40, alto: 40 } as const;

export const TAMANO_DETALLE_PRODUCTO = { ancho: 320, alto: 320 } as const;
