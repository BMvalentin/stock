"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Power } from "lucide-react";
import type { CategoriaListada } from "@/servicios/categorias/listarCategorias";
import { accionCambiarEstadoCategoria } from "@/acciones/categorias/accionCambiarEstadoCategoria";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { MenuAcciones } from "@/componentes/ui/MenuAcciones";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Boton } from "@/componentes/ui/Boton";
import { Modal } from "@/componentes/ui/Modal";
import { Alerta } from "@/componentes/ui/Alerta";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import { FormularioCategoria } from "@/componentes/categorias/FormularioCategoria";

export function TablaCategorias({
  categorias,
}: {
  categorias: CategoriaListada[];
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<CategoriaListada | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, iniciarTransicion] = useTransition();

  function abrirCrear() {
    setEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(categoria: CategoriaListada) {
    setEditando(categoria);
    setModalAbierto(true);
  }

  function alternarEstado(categoria: CategoriaListada) {
    iniciarTransicion(async () => {
      const resultado = await accionCambiarEstadoCategoria(
        categoria.id,
        !categoria.activo,
      );
      setError(resultado.error ?? null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Boton onClick={abrirCrear}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nueva categoría
        </Boton>
      </div>

      {error ? <Alerta tono="error">{error}</Alerta> : null}

      {categorias.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hay categorías"
          descripcion="Creá la primera categoría para organizar tus productos."
          accion={
            <Boton onClick={abrirCrear} variante="secundario">
              Nueva categoría
            </Boton>
          }
        />
      ) : (
        <TablaDatos
          columnas={[
            { encabezado: "Categoría" },
            { encabezado: "Productos", alineacion: "centro" },
            { encabezado: "Estado" },
            { encabezado: "", alineacion: "der" },
          ]}
          filas={categorias.map((categoria) => ({
            id: categoria.id,
            celdas: [
              <div key="nombre" className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {categoria.nombre}
                </p>
                {categoria.descripcion ? (
                  <p className="truncate text-xs text-zinc-500">
                    {categoria.descripcion}
                  </p>
                ) : null}
              </div>,
              <span key="cantidad" className="text-sm text-zinc-600">
                {categoria.cantidadProductos}
              </span>,
              <Etiqueta
                key="estado"
                tono={categoria.activo ? "exito" : "neutral"}
              >
                {categoria.activo ? "Activa" : "Inactiva"}
              </Etiqueta>,
              <div key="acciones" className="flex justify-end">
                <MenuAcciones
                  items={[
                    {
                      etiqueta: "Editar",
                      icono: <Pencil className="h-4 w-4" strokeWidth={1.75} />,
                      accion: () => abrirEditar(categoria),
                    },
                    {
                      etiqueta: categoria.activo ? "Desactivar" : "Reactivar",
                      icono: <Power className="h-4 w-4" strokeWidth={1.75} />,
                      peligro: categoria.activo,
                      accion: () => alternarEstado(categoria),
                      confirmacion: categoria.activo
                        ? {
                            titulo: "Desactivar categoría",
                            descripcion: `¿Desactivar "${categoria.nombre}"? No se podrá si tiene productos activos.`,
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

      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo={editando ? "Editar categoría" : "Nueva categoría"}
      >
        <FormularioCategoria
          categoria={editando ?? undefined}
          alCerrar={() => setModalAbierto(false)}
          alExito={() => setModalAbierto(false)}
        />
      </Modal>
    </div>
  );
}
