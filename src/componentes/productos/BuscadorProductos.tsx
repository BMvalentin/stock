"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { accionBuscarProductoPorBarcode } from "@/acciones/productos/accionBuscarProductoPorBarcode";
import { CampoBusqueda } from "@/componentes/ui/CampoBusqueda";
import { BotonEscanear } from "@/componentes/codigosBarras/BotonEscanear";
import { Modal } from "@/componentes/ui/Modal";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";

type ResultadoEscaneo =
  | { tipo: "no-encontrado"; codigo: string }
  | { tipo: "error"; mensaje: string };

// Buscador del listado de productos. Combina el buscador de texto con el
// escáner: si el código existe abre el detalle; si no, ofrece crear el
// producto con el código ya cargado.
export function BuscadorProductos({ valorInicial }: { valorInicial?: string }) {
  const router = useRouter();
  const [, iniciarTransicion] = useTransition();
  const [resultado, setResultado] = useState<ResultadoEscaneo | null>(null);

  function alDetectar(codigo: string) {
    iniciarTransicion(async () => {
      const respuesta = await accionBuscarProductoPorBarcode(codigo);

      if (!respuesta.ok) {
        setResultado({ tipo: "error", mensaje: respuesta.error });
        return;
      }

      if (respuesta.producto) {
        router.push(`/admin/productos/${respuesta.producto.id}`);
        return;
      }

      setResultado({ tipo: "no-encontrado", codigo });
    });
  }

  return (
    <>
      <CampoBusqueda
        valorInicial={valorInicial}
        placeholder="Buscar por nombre, SKU o código de barras"
        className="w-full sm:w-72"
      />
      <BotonEscanear alDetectar={alDetectar} />

      <Modal
        abierto={resultado !== null}
        alCerrar={() => setResultado(null)}
        titulo="Resultado del escaneo"
        ancho="sm"
      >
        {resultado?.tipo === "error" ? (
          <Alerta tono="error">{resultado.mensaje}</Alerta>
        ) : resultado?.tipo === "no-encontrado" ? (
          <div className="space-y-4">
            <Alerta tono="advertencia">
              No encontramos ningún producto con este código.
            </Alerta>
            <p className="text-sm text-zinc-600">
              Código:{" "}
              <span className="font-medium text-zinc-900">
                {resultado.codigo}
              </span>
            </p>
            <div className="flex justify-end gap-2">
              <Boton
                variante="secundario"
                onClick={() => setResultado(null)}
              >
                Cerrar
              </Boton>
              <EnlaceBoton
                variante="primario"
                href={`/admin/productos/nuevo?barcode=${encodeURIComponent(
                  resultado.codigo,
                )}`}
              >
                Crear producto
              </EnlaceBoton>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
