"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { accionBuscarProductosPedido } from "@/acciones/pedidos/accionBuscarProductosPedido";
import { accionBuscarProductoPorBarcode } from "@/acciones/productos/accionBuscarProductoPorBarcode";
import type { ProductoParaPedido } from "@/servicios/productos/buscarProductosParaPedido";
import {
  ETIQUETAS_UNIDAD_VENTA,
  SUFIJOS_PRECIO_UNIDAD_VENTA,
} from "@/constantes/unidadesVenta";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { formatearStockPresentacion } from "@/lib/utilidades/formatearStockPresentacion";
import type { UnidadVenta } from "@/generated/prisma/enums";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { BotonEscanear } from "@/componentes/codigosBarras/BotonEscanear";

// Buscador de productos para agregar al pedido. Busca por nombre, SKU o código
// de barras y reutiliza el escáner existente. No conoce precios finales: solo
// muestra el precio de referencia del método elegido.
export function BuscadorProductoPedido({
  onSeleccionar,
  metodoPagoId,
  moneda,
  locale,
}: {
  onSeleccionar: (producto: ProductoParaPedido, modalidad: UnidadVenta) => void;
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

    const producto = respuesta.producto;
    onSeleccionar(
      {
        id: producto.id,
        nombre: producto.nombre,
        sku: producto.sku,
        barcode: producto.barcode,
        unidadVenta: producto.unidadVenta,
        permiteVentaSuelta: producto.permiteVentaSuelta,
        pesoPresentacionKg: producto.pesoPresentacionKg,
        stockActual: producto.stockActual,
        precios: producto.precios,
        preciosSuelto: producto.preciosSuelto,
      },
      producto.unidadVenta,
    );
    setTermino("");
    setResultados([]);
    setAviso(null);
  }

  function agregar(producto: ProductoParaPedido, modalidad: UnidadVenta) {
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
            const precio = producto.precios.find(
              (actual) => actual.metodoPagoId === metodoPagoId,
            );
            const precioSuelto = producto.preciosSuelto.find(
              (actual) => actual.metodoPagoId === metodoPagoId,
            );

            return (
              <li
                key={producto.id}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {producto.nombre}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {ETIQUETAS_UNIDAD_VENTA[producto.unidadVenta]}
                    {producto.sku ? ` · SKU ${producto.sku}` : ""} · Stock{" "}
                    {producto.permiteVentaSuelta
                      ? formatearStockPresentacion(
                          producto.stockActual,
                          producto.pesoPresentacionKg,
                        )
                      : producto.stockActual}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <span className="text-sm text-zinc-700">
                    {precio
                      ? `${formatearMoneda(precio.precio, moneda, locale)} ${
                          SUFIJOS_PRECIO_UNIDAD_VENTA[producto.unidadVenta]
                        }`
                      : "Sin precio"}
                  </span>
                  <Boton
                    variante="secundario"
                    tamano="sm"
                    onClick={() => agregar(producto, producto.unidadVenta)}
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                    {producto.permiteVentaSuelta &&
                    producto.pesoPresentacionKg
                      ? `Bolsa ${producto.pesoPresentacionKg} kg`
                      : "Agregar"}
                  </Boton>
                  {producto.permiteVentaSuelta ? (
                    <Boton
                      variante="secundario"
                      tamano="sm"
                      onClick={() => agregar(producto, "KILOGRAMO")}
                      disabled={!precioSuelto}
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                      {precioSuelto
                        ? `Suelto ${formatearMoneda(
                            precioSuelto.precio,
                            moneda,
                            locale,
                          )}/kg`
                        : "Suelto sin precio"}
                    </Boton>
                  ) : null}
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
