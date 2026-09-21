"use client";

import { useState, useTransition } from "react";
import { Lock, Pencil, Trash2 } from "lucide-react";
import type { ProduccionListado } from "@/servicios/producciones/listarProducciones";
import { accionAnularProduccion } from "@/acciones/producciones/accionAnularProduccion";
import { formatearFechaCalendario } from "@/lib/utilidades/formatearFechaCalendario";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { Modal } from "@/componentes/ui/Modal";
import { Alerta } from "@/componentes/ui/Alerta";
import { MenuAcciones } from "@/componentes/ui/MenuAcciones";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { FormularioEditarProduccion } from "@/componentes/empleados/FormularioEditarProduccion";

export function TablaProducciones({
  producciones,
  moneda,
  locale,
}: {
  producciones: ProduccionListado[];
  moneda: string;
  locale: string;
}) {
  const [editar, setEditar] = useState<ProduccionListado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, iniciarTransicion] = useTransition();

  function anular(produccion: ProduccionListado) {
    iniciarTransicion(async () => {
      const resultado = await accionAnularProduccion(produccion.id);
      setError(resultado.error ?? null);
    });
  }

  if (producciones.length === 0) {
    return (
      <EstadoVacio
        titulo="Sin producción registrada"
        descripcion="Cargá la producción del empleado para poder liquidarla."
      />
    );
  }

  return (
    <div className="space-y-4">
      {error ? <Alerta tono="error">{error}</Alerta> : null}

      <TablaDatos
        columnas={[
          { encabezado: "Fecha" },
          { encabezado: "Producto" },
          { encabezado: "Cantidad", alineacion: "der" },
          { encabezado: "Precio/unidad", alineacion: "der" },
          { encabezado: "Total", alineacion: "der" },
          { encabezado: "", alineacion: "der" },
        ]}
        filas={producciones.map((produccion) => ({
          id: produccion.id,
          celdas: [
            <span key="fecha" className="whitespace-nowrap text-sm text-zinc-700">
              {formatearFechaCalendario(produccion.fecha, locale)}
            </span>,
            <div key="producto" className="flex items-center gap-2">
              <span className="text-sm text-zinc-800">
                {produccion.productoNombre}
              </span>
              {produccion.liquidacionId ? (
                <Lock
                  className="h-3.5 w-3.5 text-zinc-400"
                  strokeWidth={2}
                  aria-label="Incluida en una liquidación"
                />
              ) : null}
            </div>,
            <span key="cantidad" className="font-medium text-zinc-900">
              {produccion.cantidad}
            </span>,
            <span key="precio" className="text-zinc-700">
              {formatearMoneda(produccion.precioUnidad.toString(), moneda, locale)}
            </span>,
            <span key="total" className="font-medium text-zinc-900">
              {formatearMoneda(produccion.total.toString(), moneda, locale)}
            </span>,
            <div key="acciones" className="flex justify-end">
              <MenuAcciones
                items={[
                  {
                    etiqueta: "Corregir",
                    icono: <Pencil className="h-4 w-4" strokeWidth={1.75} />,
                    accion: () => setEditar(produccion),
                  },
                  {
                    etiqueta: "Anular",
                    icono: <Trash2 className="h-4 w-4" strokeWidth={1.75} />,
                    peligro: true,
                    accion: () => anular(produccion),
                    confirmacion: {
                      titulo: "Anular producción",
                      descripcion:
                        "Se elimina el registro de producción. La acción queda registrada en la auditoría.",
                      textoConfirmar: "Anular",
                    },
                  },
                ]}
              />
            </div>,
          ],
        }))}
      />

      <Modal
        abierto={editar !== null}
        alCerrar={() => setEditar(null)}
        titulo="Corregir producción"
      >
        {editar ? (
          <FormularioEditarProduccion
            produccion={editar}
            moneda={moneda}
            locale={locale}
            alCerrar={() => setEditar(null)}
            alExito={() => setEditar(null)}
          />
        ) : null}
      </Modal>
    </div>
  );
}
