import type { ComponentPropsWithoutRef } from "react";
import { Campo } from "@/componentes/ui/Campo";
import { estilosCampo } from "@/componentes/ui/estilosCampo";

type Props = {
  etiqueta: string;
  error?: string;
  ayuda?: string;
  requerido?: boolean;
} & Omit<ComponentPropsWithoutRef<"input">, "className" | "required">;

export function CampoTexto({
  etiqueta,
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
      <input
        id={idCampo}
        required={requerido}
        className={estilosCampo(error)}
        {...resto}
      />
    </Campo>
  );
}
