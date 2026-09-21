import { randomUUID } from "crypto";
import type { UploadApiResponse } from "cloudinary";
import { obtenerClienteCloudinary } from "@/lib/cloudinary/cliente";
import {
  ANCHO_MAXIMO_IMAGEN_ALMACENADA,
  CARPETA_IMAGENES_PRODUCTOS,
} from "@/constantes/imagenes";
import { ErrorNegocio } from "@/lib/errores/ErrorNegocio";

export type ImagenSubida = {
  url: string;
  publicId: string;
};

// Sube la imagen de un producto a Cloudinary. El nombre del recurso lo genera
// el servidor (UUID); nunca se usa el nombre ingresado por el usuario. Si la
// subida falla, lanza un error de negocio sin exponer detalles internos.
export async function subirImagenProducto(archivo: File): Promise<ImagenSubida> {
  const buffer = Buffer.from(await archivo.arrayBuffer());
  const cliente = obtenerClienteCloudinary();

  let resultado: UploadApiResponse;

  try {
    resultado = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cliente.uploader.upload_stream(
        {
          folder: CARPETA_IMAGENES_PRODUCTOS,
          public_id: randomUUID(),
          resource_type: "image",
          overwrite: false,
          transformation: [
            { width: ANCHO_MAXIMO_IMAGEN_ALMACENADA, crop: "limit" },
          ],
        },
        (error, respuesta) => {
          if (error || !respuesta) {
            reject(error ?? new Error("Respuesta vacía de Cloudinary"));
            return;
          }
          resolve(respuesta);
        },
      );

      stream.end(buffer);
    });
  } catch (error) {
    // Log seguro: solo el mensaje, sin credenciales ni detalles internos.
    console.error(
      "Error al subir una imagen de producto a Cloudinary:",
      error instanceof Error ? error.message : "Error desconocido",
    );
    throw new ErrorNegocio("No se pudo subir la imagen. Intentá nuevamente.");
  }

  return { url: resultado.secure_url, publicId: resultado.public_id };
}
