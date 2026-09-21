"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { ImageOff, Trash2, Upload } from "lucide-react";
import { validarImagenProducto } from "@/lib/validaciones/imagenes";
import { urlImagenCloudinary } from "@/lib/utilidades/urlImagenCloudinary";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

export function CampoImagenProducto({
  imagenActual,
  error,
}: {
  imagenActual?: string | null;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(imagenActual ?? null);
  const [eliminar, setEliminar] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  function liberarObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function seleccionarArchivo(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    const validacion = validarImagenProducto(archivo);

    if (!validacion.valida) {
      setErrorLocal(validacion.mensaje);
      evento.target.value = "";
      return;
    }

    liberarObjectUrl();
    const url = URL.createObjectURL(archivo);
    objectUrlRef.current = url;
    setPreview(url);
    setEliminar(false);
    setErrorLocal(null);
  }

  function quitarImagen() {
    liberarObjectUrl();
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setEliminar(true);
    setErrorLocal(null);
  }

  const srcPreview = preview
    ? preview.startsWith("blob:")
      ? preview
      : urlImagenCloudinary(preview, 128, 128)
    : null;

  const mensajeError = error ?? errorLocal;

  return (
    <div className="space-y-3">
      {mensajeError ? <Alerta tono="error">{mensajeError}</Alerta> : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
          {srcPreview ? (
            <Image
              src={srcPreview}
              alt="Vista previa de la imagen del producto"
              width={128}
              height={128}
              unoptimized={srcPreview.startsWith("blob:")}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-zinc-400">
              <ImageOff className="h-6 w-6" strokeWidth={1.5} />
              <span className="text-xs">Sin imagen</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            name="imagen"
            accept="image/jpeg,image/png,image/webp"
            onChange={seleccionarArchivo}
            className="hidden"
          />
          <input
            type="hidden"
            name="imagenEliminar"
            value={eliminar ? "1" : "0"}
          />

          <div className="flex flex-wrap gap-2">
            <Boton
              variante="secundario"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" strokeWidth={1.75} />
              {srcPreview ? "Cambiar imagen" : "Agregar imagen"}
            </Boton>

            {srcPreview ? (
              <Boton variante="secundario" onClick={quitarImagen}>
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                Eliminar imagen
              </Boton>
            ) : null}
          </div>

          <p className="text-xs text-zinc-500">JPG, PNG o WEBP. Máximo 5 MB.</p>
        </div>
      </div>
    </div>
  );
}
