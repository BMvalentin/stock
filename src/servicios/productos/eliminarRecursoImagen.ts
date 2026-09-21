import { obtenerClienteCloudinary } from "@/lib/cloudinary/cliente";

// Elimina un recurso de Cloudinary de forma best-effort. Se invoca después de
// que la base de datos quedó consistente, por lo que un fallo aquí no debe
// interrumpir la operación: solo deja un recurso huérfano y se registra.
export async function eliminarRecursoImagen(publicId: string): Promise<void> {
  if (!publicId) return;

  try {
    const cliente = obtenerClienteCloudinary();
    await cliente.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch (error) {
    console.error(
      "No se pudo eliminar la imagen de Cloudinary:",
      publicId,
      error instanceof Error ? error.message : "Error desconocido",
    );
  }
}
