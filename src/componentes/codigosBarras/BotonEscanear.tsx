"use client";

import { useState, type ReactNode } from "react";
import { Camera } from "lucide-react";
import {
  estilosBoton,
  type TamanoBoton,
  type VarianteBoton,
} from "@/componentes/ui/estilosBoton";
import { EscanerCodigoBarras } from "@/componentes/codigosBarras/EscanerCodigoBarras";

// Botón "📷 Escanear" reutilizable. Abre el escáner y entrega el código
// detectado a quien lo use; no contiene lógica de negocio.
export function BotonEscanear({
  alDetectar,
  etiqueta = "Escanear",
  variante = "secundario",
  tamano = "md",
  icono,
}: {
  alDetectar: (codigo: string) => void;
  etiqueta?: string;
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  icono?: ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label={etiqueta}
        className={estilosBoton(variante, tamano)}
      >
        {icono ?? <Camera className="h-4 w-4" strokeWidth={1.75} />}
        {etiqueta}
      </button>
      <EscanerCodigoBarras
        abierto={abierto}
        alCerrar={() => setAbierto(false)}
        alDetectar={(codigo) => {
          setAbierto(false);
          alDetectar(codigo);
        }}
      />
    </>
  );
}
