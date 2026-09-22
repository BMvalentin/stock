"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { accionBuscarProductosPedido } from "@/acciones/pedidos/accionBuscarProductosPedido";
import { accionBuscarProductoPorBarcode } from "@/acciones/productos/accionBuscarProductoPorBarcode";
import type {
  ModalidadParaPedido,
  ProductoParaPedido,
} from "@/servicios/productos/buscarProductosParaPedido";
import { calcularPrecioLinea } from "@/servicios/precios/calcularPrecioLinea";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearStockPresentacion } from "@/lib/utilidades/formatearStockPresentacion";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { BotonEscanear } from "@/componentes/codigosBarras/BotonEscanear";

// Precio unitario de referencia (cantidad 1) para mostrar antes de armar el
// pedido. El servidor recalcula el precio real según la cantidad.
function precioReferencia(
  modalidad: ModalidadParaPedido,
  metodoPagoId: string,
): number | null {
  const reglas = modalidad.reglas.map((regla, indice) => ({
    id: String(indice),
    ...regla,
    prioridad: 0,
  }));
  const resultado = calcularPrecioLinea(reglas, metodoPagoId, 1);

  return resultado ? resultado.precioUnitario : null;
}

// Buscador de productos para agregar al pedido. Busca por nombre, SKU o código
// de barras y reutiliza el escáner existente. Muestra el precio de referencia de
// cada modalidad con el método elegido.
export function BuscadorProductoPedido({
  onSeleccionar,
  metodoPagoId,
  moneda,
  locale,
}: {
  onSeleccionar: (
    producto: ProductoParaPedido,
    modalidad: ModalidadParaPedido,
  ) => void;
  metodoPagoId: string;
  moneda: string;
  locale: string;
}) {
  const [termino, setTermino] = useState("");
  const [resultados, setResultados] = useState<ProductoParaPedido[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function buscar() {
      await Promise.resolve();
      if (cancelado) return;

      const consulta = termino.trim();

      if (consulta.length < 2) {
        setResultados([]);
        setBuscando(false);
        return;
      }

      setBuscando(true);
      const respuesta = await accionBuscarProductosPedido(consulta);

      if (cancelado) return;
      setBuscando(false);
      setResultados(respuesta.ok ? respuesta.productos : []);
    }

    const temporizador = setTimeout(buscar, 250);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [termino]);

  async function alEscanear(codigo: string) {
    const respuesta = await accionBuscarProductoPorBarcode(codigo);

    if (!respuesta.ok) {
      setAviso(respuesta.error);
      return;
    }

    if (!respuesta.producto) {
      setAviso(`No encontramos un producto con el código ${codigo}.`);
      return;
    }

    const base =
      respuesta.producto.modalidades.find((modalidad) => modalidad.esBase) ??
      respuesta.producto.modalidades[0];

    if (!base) {
      setAviso("El producto no tiene modalidades de venta configuradas.");
      return;
    }

    onSeleccionar(respuesta.producto, base);
    setTermino("");
    setResultados([]);
    setAviso(null);
  }

  function agregar(producto: ProductoParaPedido, modalidad: ModalidadParaPedido) {
    onSeleccionar(producto, modalidad);
    setTermino("");
    setResultados([]);
    setAviso(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <CampoTexto
            etiqueta="Buscar producto"
            value={termino}
            onChange={(evento) => setTermino(evento.target.value)}
            placeholder="Nombre, SKU o código de barras"
            autoComplete="off"
          />
        </div>
        <BotonEscanear alDetectar={alEscanear} etiqueta="Escanear" />
      </div>

      {aviso ? <Alerta tono="advertencia">{aviso}</Alerta> : null}

      {buscando ? (
        <p className="text-xs text-zinc-500">Buscando…</p>
      ) : null}

      {resultados.length > 0 ? (
        <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
          {resultados.map((producto) => {
            const base =
              producto.modalidades.find((modalidad) => modalidad.esBase) ??
              producto.modalidades[0];

            return (
              <li
                key={producto.id}
                className="flex flex-wrap items-center justify-between gap-3 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {producto.nombre}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {producto.sku ? `SKU ${producto.sku} · ` : ""}Stock{" "}
                    {producto.unidadStock === "KILOGRAMO"
                      ? formatearStockPresentacion(
                          producto.stockActual,
                          base?.contenido ?? null,
                        )
                      : producto.stockActual}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  {producto.modalidades.map((modalidad) => {
                    const precio = precioReferencia(modalidad, metodoPagoId);

                    return (
                      <Boton
                        key={modalidad.id}
                        variante="secundario"
                        tamano="sm"
                        onClick={() => agregar(producto, modalidad)}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                        {modalidad.nombre}
                        {precio !== null
                          ? ` · ${formatearMoneda(precio, moneda, locale)}${
                              modalidad.unidadVenta === "KILOGRAMO" ? "/kg" : ""
                            }`
                          : " · sin precio"}
                      </Boton>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {termino.trim().length >= 2 && !buscando && resultados.length === 0 ? (
        <p className="flex items-center gap-1 text-xs text-zinc-500">
          <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
          Sin resultados para “{termino.trim()}”.
        </p>
      ) : null}
    </div>
  );
}
