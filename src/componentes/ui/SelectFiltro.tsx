"use client";

import type { OpcionCampo } from "@/componentes/ui/CampoSelect";

// Select de filtro que envía el formulario contenedor al cambiar de valor.
export function SelectFiltro({
  nombre,
  valorInicial,
  marcador,
  opciones,
}: {
  nombre: string;
  valorInicial?: string;
  marcador: string;
  opciones: OpcionCampo[];
}) {
  return (
    <select
      name={nombre}
      defaultValue={valorInicial ?? ""}
      onChange={(evento) => evento.currentTarget.form?.requestSubmit()}
      className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
    >
      <option value="">{marcador}</option>
      {opciones.map((opcion) => (
        <option key={opcion.valor} value={opcion.valor}>
          {opcion.etiqueta}
        </option>
      ))}
    </select>
  );
}
