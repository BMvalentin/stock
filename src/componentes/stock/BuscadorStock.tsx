"use client";

import { useState, useTransition } from "react";
import { accionBuscarProductoPorBarcode } from "@/acciones/productos/accionBuscarProductoPorBarcode";
import type { ProductoPorBarcode } from "@/servicios/productos/buscarProductoPorBarcode";
import { CampoBusqueda } from "@/componentes/ui/CampoBusqueda";
import { BotonEscanear } from "@/componentes/codigosBarras/BotonEscanear";
import { ResumenProductoBarcode } from "@/componentes/codigosBarras/ResumenProductoBarcode";
import { Modal } from "@/componentes/ui/Modal";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { EnlaceBoton } from "@/componentes/ui/EnlaceBoton";

type ResultadoEscaneo =
  | { tipo: "encontrado"; producto: ProductoPorBarcode }
  | { tipo: "no-encontrado"; codigo: string }
  | { tipo: "error"; mensaje: string };

// Buscador del listado de stock. Al escanear muestra el stock actual, el
// mínimo y el estado del producto, con las acciones según el rol.
export function BuscadorStock({
  valorInicial,
  esAdmin,
  moneda,
  locale,
}: {
  valorInicial?: string;
  esAdmin: boolean;
  moneda: string;
  locale: string;
}) {
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
        setResultado({ tipo: "encontrado", producto: respuesta.producto });
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
      <BotonEscanear alDetectar={alDetectar} etiqueta="Escanear producto" />

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
              <Boton variante="secundario" onClick={() => setResultado(null)}>
                Cerrar
              </Boton>
              {esAdmin ? (
                <EnlaceBoton
                  variante="primario"
                  href={`/admin/productos/nuevo?barcode=${encodeURIComponent(
                    resultado.codigo,
                  )}`}
                >
                  Crear producto
                </EnlaceBoton>
              ) : null}
            </div>
          </div>
        ) : resultado?.tipo === "encontrado" ? (
          <div className="space-y-4">
            <ResumenProductoBarcode
              producto={resultado.producto}
              moneda={moneda}
              locale={locale}
            />
            <div className="flex justify-end gap-2">
              <Boton variante="secundario" onClick={() => setResultado(null)}>
                Cerrar
              </Boton>
              {esAdmin ? (
                <EnlaceBoton
                  variante="primario"
                  href={`/admin/stock?producto=${resultado.producto.id}`}
                >
                  Registrar movimiento
                </EnlaceBoton>
              ) : null}
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
