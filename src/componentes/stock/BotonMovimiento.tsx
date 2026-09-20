"use client";

import { useState, type ReactNode } from "react";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";
import {
  estilosBoton,
  type TamanoBoton,
  type VarianteBoton,
} from "@/componentes/ui/estilosBoton";
import { Modal } from "@/componentes/ui/Modal";
import { FormularioMovimiento } from "@/componentes/stock/FormularioMovimiento";

export function BotonMovimiento({
  productos,
  productoInicialId,
  etiqueta = "Registrar movimiento",
  variante = "primario",
  tamano = "md",
  abrirInicial = false,
  icono,
}: {
  productos: OpcionCampo[];
  productoInicialId?: string;
  etiqueta?: string;
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  abrirInicial?: boolean;
  icono?: ReactNode;
}) {
  const [abierto, setAbierto] = useState(abrirInicial);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={estilosBoton(variante, tamano)}
      >
        {icono}
        {etiqueta}
      </button>
      <Modal
        abierto={abierto}
        alCerrar={() => setAbierto(false)}
        titulo="Registrar movimiento de stock"
      >
        <FormularioMovimiento
          productos={productos}
          productoInicialId={productoInicialId}
          alCerrar={() => setAbierto(false)}
          alExito={() => setAbierto(false)}
        />
      </Modal>
    </>
  );
}
