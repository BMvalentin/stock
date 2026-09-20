import type { ComponentPropsWithoutRef } from "react";
import { Campo } from "@/componentes/ui/Campo";
import { estilosCampo } from "@/componentes/ui/estilosCampo";

export type OpcionCampo = { valor: string; etiqueta: string };

type Props = {
  etiqueta: string;
  opciones: OpcionCampo[];
  marcador?: string;
  error?: string;
  ayuda?: string;
  requerido?: boolean;
} & Omit<ComponentPropsWithoutRef<"select">, "className" | "required">;

export function CampoSelect({
  etiqueta,
  opciones,
  marcador,
  error,
  ayuda,
  id,
  requerido,
  ...resto
}: Props) {
  const idCampo = id ?? resto.name;

  return (
    <Campo
      etiqueta={etiqueta}
      htmlFor={idCampo}
      requerido={requerido}
      error={error}
      ayuda={ayuda}
    >
      <select
        id={idCampo}
        required={requerido}
        className={estilosCampo(error)}
        {...resto}
      >
        {marcador ? <option value="">{marcador}</option> : null}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </Campo>
  );
}
