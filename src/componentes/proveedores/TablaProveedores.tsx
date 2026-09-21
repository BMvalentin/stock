"use client";

import { useState, useTransition } from "react";
import { Eye, Pencil, Plus, Power } from "lucide-react";
import type { ProveedorListado } from "@/servicios/proveedores/listarProveedores";
import { accionCambiarEstadoProveedor } from "@/acciones/proveedores/accionCambiarEstadoProveedor";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { MenuAcciones } from "@/componentes/ui/MenuAcciones";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Boton } from "@/componentes/ui/Boton";
import { Modal } from "@/componentes/ui/Modal";
import { Alerta } from "@/componentes/ui/Alerta";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import { formatearCuit } from "@/lib/utilidades/formatearCuit";
import {
  FormularioProveedor,
  type ProveedorFormulario,
} from "@/componentes/proveedores/FormularioProveedor";

export function TablaProveedores({
  proveedores,
  esAdmin,
}: {
  proveedores: ProveedorListado[];
  esAdmin: boolean;
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<ProveedorListado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, iniciarTransicion] = useTransition();

  function abrirCrear() {
    setEditando(null);
    setModalAbierto(true);
  }

  function alternarEstado(proveedor: ProveedorListado) {
    iniciarTransicion(async () => {
      const resultado = await accionCambiarEstadoProveedor(
        proveedor.id,
        !proveedor.activo,
      );
      setError(resultado.error ?? null);
    });
  }

  return (
    <div className="space-y-4">
      {esAdmin ? (
        <div className="flex justify-end">
          <Boton onClick={abrirCrear}>
            <Plus className="h-4 w-4" strokeWidth={2} />
            Nuevo proveedor
          </Boton>
        </div>
      ) : null}

      {error ? <Alerta tono="error">{error}</Alerta> : null}

      {proveedores.length === 0 ? (
        <EstadoVacio
          titulo="Sin proveedores"
          descripcion="No se encontraron proveedores con los filtros aplicados."
        />
      ) : (
        <TablaDatos
          columnas={[
            { encabezado: "Proveedor" },
            { encabezado: "Contacto" },
            ...(esAdmin
              ? [
                  { encabezado: "CUIT/CUIL" },
                  { encabezado: "Cuenta de pago principal" },
                ]
              : []),
            { encabezado: "Productos", alineacion: "centro" },
            { encabezado: "Estado" },
            { encabezado: "", alineacion: "der" },
          ]}
          filas={proveedores.map((proveedor) => ({
            id: proveedor.id,
            celdas: [
              <div key="nombre" className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {proveedor.nombre}
                </p>
                {proveedor.empresa ? (
                  <p className="truncate text-xs text-zinc-500">
                    {proveedor.empresa}
                  </p>
                ) : null}
              </div>,
              <div key="contacto" className="min-w-0 text-xs text-zinc-600">
                {proveedor.telefono ? <p>{proveedor.telefono}</p> : null}
                {proveedor.email ? (
                  <p className="truncate">{proveedor.email}</p>
                ) : null}
                {!proveedor.telefono && !proveedor.email ? (
                  <span className="text-zinc-400">Sin datos</span>
                ) : null}
              </div>,
              ...(esAdmin
                ? [
                    <span
                      key="cuit"
                      className="whitespace-nowrap text-xs text-zinc-600"
                    >
                      {formatearCuit(proveedor.cuit) || (
                        <span className="text-zinc-400">—</span>
                      )}
                    </span>,
                    <div key="cuenta" className="min-w-0 text-xs text-zinc-600">
                      {proveedor.cuentaPrincipal ? (
                        <>
                          {proveedor.cuentaPrincipal.banco ||
                          proveedor.cuentaPrincipal.alias ? (
                            <p className="truncate">
                              {[
                                proveedor.cuentaPrincipal.banco,
                                proveedor.cuentaPrincipal.alias,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          ) : null}
                          {proveedor.cuentaPrincipal.cbuEnmascarado ||
                          proveedor.cuentaPrincipal.cvuEnmascarado ? (
                            <p className="truncate text-zinc-400">
                              {proveedor.cuentaPrincipal.cbuEnmascarado ??
                                proveedor.cuentaPrincipal.cvuEnmascarado}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-zinc-400">Sin datos</span>
                      )}
                    </div>,
                  ]
                : []),
              <span key="productos" className="text-sm text-zinc-600">
                {proveedor.cantidadProductos}
              </span>,
              <Etiqueta
                key="estado"
                tono={proveedor.activo ? "exito" : "neutral"}
              >
                {proveedor.activo ? "Activo" : "Inactivo"}
              </Etiqueta>,
              <div key="acciones" className="flex justify-end">
                <MenuAcciones
                  items={[
                    {
                      etiqueta: "Ver detalle",
                      icono: <Eye className="h-4 w-4" strokeWidth={1.75} />,
                      href: `/admin/proveedores/${proveedor.id}`,
                    },
                    ...(esAdmin
                      ? [
                          {
                            etiqueta: "Editar",
                            icono: (
                              <Pencil className="h-4 w-4" strokeWidth={1.75} />
                            ),
                            accion: () => {
                              setEditando(proveedor);
                              setModalAbierto(true);
                            },
                          },
                          {
                            etiqueta: proveedor.activo
                              ? "Desactivar"
                              : "Reactivar",
                            icono: (
                              <Power className="h-4 w-4" strokeWidth={1.75} />
                            ),
                            peligro: proveedor.activo,
                            accion: () => alternarEstado(proveedor),
                            confirmacion: proveedor.activo
                              ? {
                                  titulo: "Desactivar proveedor",
                                  descripcion: `¿Desactivar "${proveedor.nombre}"?`,
                                  textoConfirmar: "Desactivar",
                                }
                              : undefined,
                          },
                        ]
                      : []),
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
        titulo={editando ? "Editar proveedor" : "Nuevo proveedor"}
        ancho="lg"
      >
        <FormularioProveedor
          proveedor={(editando as ProveedorFormulario | null) ?? undefined}
          alCerrar={() => setModalAbierto(false)}
          alExito={() => setModalAbierto(false)}
        />
      </Modal>
    </div>
  );
}
