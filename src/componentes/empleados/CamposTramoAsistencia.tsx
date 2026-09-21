"use client";

import { CampoTexto } from "@/componentes/ui/CampoTexto";

// Campos de entrada y salida de un tramo de asistencia. Se reutiliza en el alta
// y en la corrección, tanto para el tramo 1 como para el tramo 2.
export function CamposTramoAsistencia({
  titulo,
  nameEntrada,
  nameSalida,
  entradaInicial,
  salidaInicial,
  errorEntrada,
  errorSalida,
}: {
  titulo: string;
  nameEntrada: string;
  nameSalida: string;
  entradaInicial?: string;
  salidaInicial?: string;
  errorEntrada?: string;
  errorSalida?: string;
}) {
  return (
    <fieldset className="rounded-md border border-zinc-200 p-4">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {titulo}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto
          etiqueta="Entrada"
          name={nameEntrada}
          type="time"
          defaultValue={entradaInicial}
          error={errorEntrada}
        />
        <CampoTexto
          etiqueta="Salida"
          name={nameSalida}
          type="time"
          defaultValue={salidaInicial}
          error={errorSalida}
        />
      </div>
    </fieldset>
  );
}
