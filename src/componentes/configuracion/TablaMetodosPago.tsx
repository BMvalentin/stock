"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Power } from "lucide-react";
import type { MetodoPagoListado } from "@/servicios/configuracion/listarMetodosPago";
import { accionCambiarEstadoMetodoPago } from "@/acciones/configuracion/accionCambiarEstadoMetodoPago";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { MenuAcciones } from "@/componentes/ui/MenuAcciones";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Boton } from "@/componentes/ui/Boton";
import { Modal } from "@/componentes/ui/Modal";
import { Alerta } from "@/componentes/ui/Alerta";
import {
  FormularioMetodoPago,
  type MetodoPagoFormulario,
} from "@/componentes/configuracion/FormularioMetodoPago";

export function TablaMetodosPago({
  metodos,
}: {
  metodos: MetodoPagoListado[];
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<MetodoPagoListado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, iniciarTransicion] = useTransition();

  function alternarEstado(metodo: MetodoPagoListado) {
    iniciarTransicion(async () => {
      const resultado = await accionCambiarEstadoMetodoPago(
        metodo.id,
        !metodo.activo,
      );
      setError(resultado.error ?? null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Boton
          onClick={() => {
            setEditando(null);
            setModalAbierto(true);
          }}
          variante="secundario"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nuevo método
        </Boton>
      </div>

      {error ? <Alerta tono="error">{error}</Alerta> : null}

      <TablaDatos
        columnas={[
          { encabezado: "Método" },
          { encabezado: "Código" },
          { encabezado: "Precios cargados", alineacion: "centro" },
          { encabezado: "Estado" },
          { encabezado: "", alineacion: "der" },
        ]}
        filas={metodos.map((metodo) => ({
          id: metodo.id,
          celdas: [
            <span key="nombre" className="text-sm font-medium text-zinc-900">
              {metodo.nombre}
            </span>,
            <span key="codigo" className="text-xs text-zinc-500">
              {metodo.codigo}
            </span>,
            <span key="precios" className="text-sm text-zinc-600">
              {metodo.cantidadPrecios}
            </span>,
            <Etiqueta
              key="estado"
              tono={metodo.activo ? "exito" : "neutral"}
            >
              {metodo.activo ? "Activo" : "Inactivo"}
            </Etiqueta>,
            <div key="acciones" className="flex justify-end">
              <MenuAcciones
                items={[
                  {
                    etiqueta: "Editar",
                    icono: <Pencil className="h-4 w-4" strokeWidth={1.75} />,
                    accion: () => {
                      setEditando(metodo);
                      setModalAbierto(true);
                    },
                  },
                  {
                    etiqueta: metodo.activo ? "Desactivar" : "Reactivar",
                    icono: <Power className="h-4 w-4" strokeWidth={1.75} />,
                    peligro: metodo.activo,
                    accion: () => alternarEstado(metodo),
                  },
                ]}
              />
            </div>,
          ],
        }))}
      />

      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo={editando ? "Editar método de pago" : "Nuevo método de pago"}
      >
        <FormularioMetodoPago
          metodo={(editando as MetodoPagoFormulario | null) ?? undefined}
          alCerrar={() => setModalAbierto(false)}
          alExito={() => setModalAbierto(false)}
        />
      </Modal>
    </div>
  );
}
