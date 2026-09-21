"use client";

import { useActionState, useState, useTransition } from "react";
import { Pencil, Plus, Power } from "lucide-react";
import { accionCrearTarifaProducto } from "@/acciones/tarifasProducto/accionCrearTarifaProducto";
import { accionCambiarEstadoTarifaProducto } from "@/acciones/tarifasProducto/accionCambiarEstadoTarifaProducto";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import type { TarifaProductoListado } from "@/servicios/tarifasProducto/listarTarifasProducto";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";
import { formatearMoneda } from "@/lib/utilidades/formatearMoneda";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { CampoSelect } from "@/componentes/ui/CampoSelect";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Modal } from "@/componentes/ui/Modal";
import { PanelSeccion } from "@/componentes/ui/PanelSeccion";
import { MenuAcciones } from "@/componentes/ui/MenuAcciones";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { FormularioEditarTarifa } from "@/componentes/empleados/FormularioEditarTarifa";

export function SeccionTarifas({
  empleadoId,
  tarifas,
  productos,
  moneda,
  locale,
}: {
  empleadoId: string;
  tarifas: TarifaProductoListado[];
  productos: OpcionCampo[];
  moneda: string;
  locale: string;
}) {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accionCrearTarifaProducto,
    ESTADO_FORMULARIO_INICIAL,
  );
  const [editar, setEditar] = useState<TarifaProductoListado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciarTransicion] = useTransition();

  function alternarEstado(tarifa: TarifaProductoListado) {
    iniciarTransicion(async () => {
      const resultado = await accionCambiarEstadoTarifaProducto(
        tarifa.id,
        !tarifa.activo,
      );
      setError(resultado.error ?? null);
    });
  }

  return (
    <PanelSeccion
      titulo="Tarifas de producción"
      descripcion="Precio que se paga a este empleado por unidad producida. Es independiente del precio de venta."
    >
      <div className="space-y-4">
        <form
          action={enviar}
          className="grid items-end gap-3 sm:grid-cols-[1fr_10rem_auto]"
        >
          <input type="hidden" name="empleadoId" value={empleadoId} />
          <CampoSelect
            etiqueta="Producto"
            name="productoId"
            opciones={productos}
            marcador="Seleccioná un producto"
            requerido
            error={estado.errores?.productoId?.[0]}
          />
          <CampoTexto
            etiqueta="Precio por unidad"
            name="precioUnidad"
            type="number"
            step="0.01"
            min="0"
            requerido
            error={estado.errores?.precioUnidad?.[0]}
          />
          <Boton type="submit" cargando={pendiente}>
            <Plus className="h-4 w-4" strokeWidth={2} />
            Agregar tarifa
          </Boton>
        </form>

        {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}
        {estado.exito ? <Alerta tono="exito">{estado.mensaje}</Alerta> : null}
        {error ? <Alerta tono="error">{error}</Alerta> : null}

        {tarifas.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Todavía no hay tarifas configuradas.
          </p>
        ) : (
          <TablaDatos
            columnas={[
              { encabezado: "Producto" },
              { encabezado: "Precio/unidad", alineacion: "der" },
              { encabezado: "Estado" },
              { encabezado: "", alineacion: "der" },
            ]}
            filas={tarifas.map((tarifa) => ({
              id: tarifa.id,
              celdas: [
                <div key="producto" className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {tarifa.productoNombre}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {tarifa.productoSku ?? "—"}
                  </p>
                </div>,
                <span key="precio" className="font-medium text-zinc-900">
                  {formatearMoneda(tarifa.precioUnidad.toString(), moneda, locale)}
                </span>,
                <Etiqueta
                  key="estado"
                  tono={tarifa.activo ? "exito" : "neutral"}
                >
                  {tarifa.activo ? "Activo" : "Inactivo"}
                </Etiqueta>,
                <div key="acciones" className="flex justify-end">
                  <MenuAcciones
                    items={[
                      {
                        etiqueta: "Editar precio",
                        icono: <Pencil className="h-4 w-4" strokeWidth={1.75} />,
                        accion: () => setEditar(tarifa),
                      },
                      {
                        etiqueta: tarifa.activo ? "Desactivar" : "Reactivar",
                        icono: <Power className="h-4 w-4" strokeWidth={1.75} />,
                        peligro: tarifa.activo,
                        accion: () => alternarEstado(tarifa),
                        confirmacion: tarifa.activo
                          ? {
                              titulo: "Desactivar tarifa",
                              descripcion:
                                "No se usará para nuevas producciones. El historial se conserva y puede reactivarse.",
                              textoConfirmar: "Desactivar",
                            }
                          : undefined,
                      },
                    ]}
                  />
                </div>,
              ],
            }))}
          />
        )}
      </div>

      <Modal
        abierto={editar !== null}
        alCerrar={() => setEditar(null)}
        titulo="Editar tarifa de producción"
      >
        {editar ? (
          <FormularioEditarTarifa
            tarifa={editar}
            alCerrar={() => setEditar(null)}
            alExito={() => setEditar(null)}
          />
        ) : null}
      </Modal>

      {enviando ? (
        <p className="text-xs text-zinc-400">Guardando cambios…</p>
      ) : null}
    </PanelSeccion>
  );
}
