import Link from "next/link";
import type { ReactNode } from "react";
import {
  estilosBoton,
  type TamanoBoton,
  type VarianteBoton,
} from "@/componentes/ui/estilosBoton";

export function EnlaceBoton({
  href,
  variante = "secundario",
  tamano = "md",
  children,
}: {
  href: string;
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={estilosBoton(variante, tamano)}>
      {children}
    </Link>
  );
}
