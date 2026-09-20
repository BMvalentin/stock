import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import {
  estilosBoton,
  type TamanoBoton,
  type VarianteBoton,
} from "@/componentes/ui/estilosBoton";

type Props = {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  cargando?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"button">, "className">;

export function Boton({
  variante,
  tamano,
  cargando,
  children,
  disabled,
  type = "button",
  ...resto
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={estilosBoton(variante, tamano)}
      {...resto}
    >
      {cargando ? (
        <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2} />
      ) : null}
      {children}
    </button>
  );
}
