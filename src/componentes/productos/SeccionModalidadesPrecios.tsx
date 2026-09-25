"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ModalidadDetalle } from "@/servicios/productos/obtenerProducto";
import type { MetodoPagoActivo } from "@/servicios/metodosPago/listarMetodosPagoActivos";
import type { TipoPrecio, UnidadVenta } from "@/generated/prisma/enums";
import { estilosCampo } from "@/componentes/ui/estilosCampo";
import { SeccionFormulario } from "@/componentes/ui/SeccionFormulario";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";

type ReglaUI = {
  clave: string;
  id?: string;
  metodoPagoId: string | null;
  cantidadDesde: string;
  cantidadHasta: string;
  tipoPrecio: TipoPrecio;
  precio: string;
  activo: boolean;
};

type ModalidadUI = {
  clave: string;
  id?: string;
  nombre: string;
  unidadVenta: UnidadVenta;
  contenido: string;
  etiquetaPresentacion: string;
  esBase: boolean;
  activo: boolean;
  reglas: ReglaUI[];
};

function usaRangoSuperior(tipoPrecio: TipoPrecio): boolean {
  return tipoPrecio === "UNITARIO";
}

function nuevaRegla(): ReglaUI {
  return {
    clave: crypto.randomUUID(),
    metodoPagoId: null,
    cantidadDesde: "1",
    cantidadHasta: "",
    tipoPrecio: "UNITARIO",
    precio: "",
    activo: true,
  };
}

function nuevaModalidad(): ModalidadUI {
  return {
    clave: crypto.randomUUID(),
    nombre: "Unidad",
    unidadVenta: "UNIDAD",
    contenido: "",
    etiquetaPresentacion: "",
    esBase: true,
    activo: true,
    reglas: [nuevaRegla()],
  };
}

function mapearInicial(modalidades: ModalidadDetalle[]): ModalidadUI[] {
  if (modalidades.length === 0) return [nuevaModalidad()];

  return modalidades.map((modalidad) => ({
    clave: crypto.randomUUID(),
    id: modalidad.id,
    nombre: modalidad.nombre,
    unidadVenta: modalidad.unidadVenta,
    contenido: modalidad.contenido === null ? "" : String(modalidad.contenido),
    etiquetaPresentacion: modalidad.etiquetaPresentacion ?? "",
    esBase: modalidad.esBase,
    activo: modalidad.activo,
    reglas:
      modalidad.reglas.length > 0
        ? modalidad.reglas.map((regla) => ({
            clave: crypto.randomUUID(),
            id: regla.id,
            metodoPagoId: regla.metodoPagoId,
            cantidadDesde: String(regla.cantidadDesde),
            cantidadHasta:
              regla.cantidadHasta === null ? "" : String(regla.cantidadHasta),
            tipoPrecio: regla.tipoPrecio,
            precio: String(regla.precio),
            activo: regla.activo,
          }))
        : [nuevaRegla()],
  }));
}

function serializar(modalidades: ModalidadUI[]): string {
  return JSON.stringify(
    modalidades.map((modalidad, orden) => ({
      ...(modalidad.id ? { id: modalidad.id } : {}),
      nombre: modalidad.nombre.trim(),
      unidadVenta: modalidad.unidadVenta,
      contenido: modalidad.contenido.trim() === "" ? null : Number(modalidad.contenido),
      etiquetaPresentacion:
        modalidad.etiquetaPresentacion.trim() === ""
          ? null
          : modalidad.etiquetaPresentacion.trim(),
      esBase: modalidad.esBase,
      activo: modalidad.activo,
      orden,
      reglas: modalidad.reglas.map((regla) => ({
        ...(regla.id ? { id: regla.id } : {}),
        metodoPagoId: regla.metodoPagoId,
        cantidadDesde:
          regla.cantidadDesde.trim() === "" ? 0 : Number(regla.cantidadDesde),
        cantidadHasta:
          !usaRangoSuperior(regla.tipoPrecio) || regla.cantidadHasta.trim() === ""
            ? null
            : Number(regla.cantidadHasta),
        tipoPrecio: regla.tipoPrecio,
        precio: regla.precio.trim() === "" ? 0 : Number(regla.precio),
        activo: regla.activo,
      })),
    })),
  );
}

export function SeccionModalidadesPrecios({
  metodosPago,
  modalidadesIniciales,
  error,
}: {
  metodosPago: MetodoPagoActivo[];
  modalidadesIniciales: ModalidadDetalle[];
  error?: string;
}) {
  const [modalidades, setModalidades] = useState<ModalidadUI[]>(() =>
    mapearInicial(modalidadesIniciales),
  );

  function actualizarModalidad(
    clave: string,
    cambios: Partial<ModalidadUI>,
  ) {
    setModalidades((actuales) =>
      actuales.map((modalidad) =>
        modalidad.clave === clave ? { ...modalidad, ...cambios } : modalidad,
      ),
    );
  }

  function marcarBase(clave: string) {
    setModalidades((actuales) =>
      actuales.map((modalidad) => ({
        ...modalidad,
        esBase: modalidad.clave === clave,
      })),
    );
  }

  function quitarModalidad(clave: string) {
    setModalidades((actuales) =>
      actuales.filter((modalidad) => modalidad.clave !== clave),
    );
  }

  function actualizarRegla(
    modalidadClave: string,
    reglaClave: string,
    cambios: Partial<ReglaUI>,
  ) {
    setModalidades((actuales) =>
      actuales.map((modalidad) =>
        modalidad.clave === modalidadClave
          ? {
              ...modalidad,
              reglas: modalidad.reglas.map((regla) =>
                regla.clave === reglaClave ? { ...regla, ...cambios } : regla,
              ),
            }
          : modalidad,
      ),
    );
  }

  function agregarRegla(modalidadClave: string) {
    setModalidades((actuales) =>
      actuales.map((modalidad) =>
        modalidad.clave === modalidadClave
          ? { ...modalidad, reglas: [...modalidad.reglas, nuevaRegla()] }
          : modalidad,
      ),
    );
  }

  function quitarRegla(modalidadClave: string, reglaClave: string) {
    setModalidades((actuales) =>
      actuales.map((modalidad) =>
        modalidad.clave === modalidadClave
          ? {
              ...modalidad,
              reglas: modalidad.reglas.filter(
                (regla) => regla.clave !== reglaClave,
              ),
            }
          : modalidad,
      ),
    );
  }

  const opcionesMetodo = [
    { valor: "", etiqueta: "Todos los métodos" },
    ...metodosPago.map((metodo) => ({
      valor: metodo.id,
      etiqueta: metodo.nombre,
    })),
  ];

  return (
    <SeccionFormulario
      titulo="Modalidades y precios"
      descripcion="Cada modalidad define cómo se vende (por unidad o por kg) y sus precios. Podés agregar escalas por cantidad y promociones."
    >
      {error ? <Alerta tono="error">{error}</Alerta> : null}

      {modalidades.map((modalidad) => {
        const porPeso = modalidad.unidadVenta === "KILOGRAMO";

        return (
          <div
            key={modalidad.clave}
            className="space-y-4 rounded-lg border border-zinc-200 p-4"
          >
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex-1 space-y-1.5">
                <span className="block text-sm font-medium text-zinc-700">
                  Nombre de la modalidad
                </span>
                <input
                  value={modalidad.nombre}
                  onChange={(evento) =>
                    actualizarModalidad(modalidad.clave, {
                      nombre: evento.target.value,
                    })
                  }
                  placeholder="Bolsa 15 kg, Suelto, Unidad..."
                  className={estilosCampo()}
                />
              </label>

              <label className="space-y-1.5">
                <span className="block text-sm font-medium text-zinc-700">
                  Unidad de venta
                </span>
                <select
                  value={modalidad.unidadVenta}
                  onChange={(evento) =>
                    actualizarModalidad(modalidad.clave, {
                      unidadVenta: evento.target.value as UnidadVenta,
                    })
                  }
                  className={estilosCampo()}
                >
                  <option value="UNIDAD">Por unidad</option>
                  <option value="KILOGRAMO">Por kg</option>
                </select>
              </label>

              <label className="flex items-center gap-2 pb-2 text-sm text-zinc-700">
                <input
                  type="radio"
                  name="modalidadBase"
                  checked={modalidad.esBase}
                  onChange={() => marcarBase(modalidad.clave)}
                  className="h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-900/20"
                />
                Principal
              </label>

              <Boton
                variante="fantasma"
                tamano="sm"
                onClick={() => quitarModalidad(modalidad.clave)}
                aria-label="Quitar modalidad"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </Boton>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="block text-sm font-medium text-zinc-700">
                  Contenido por unidad (opcional)
                </span>
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={modalidad.contenido}
                  onChange={(evento) =>
                    actualizarModalidad(modalidad.clave, {
                      contenido: evento.target.value,
                    })
                  }
                  placeholder="Ej.: 15 para una bolsa de 15 kg"
                  className={estilosCampo()}
                />
                <span className="block text-xs text-zinc-500">
                  Cuánto stock descuenta 1 unidad de esta modalidad.
                </span>
              </label>

              <label className="space-y-1.5">
                <span className="block text-sm font-medium text-zinc-700">
                  Presentación (opcional)
                </span>
                <input
                  value={modalidad.etiquetaPresentacion}
                  onChange={(evento) =>
                    actualizarModalidad(modalidad.clave, {
                      etiquetaPresentacion: evento.target.value,
                    })
                  }
                  placeholder="Ej.: 15 kg"
                  className={estilosCampo()}
                />
                <span className="block text-xs text-zinc-500">
                  Texto informativo para mostrar al operador.
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700">Precios</p>
              <p className="text-xs text-zinc-500">
                “Por unidad” cobra precio × cantidad dentro del rango. “Precio
                del conjunto” es una promoción: X unidades por un total (se
                aplica en múltiplos completos). “Presentación” es una
                presentación discreta: se combina tomando siempre la más grande.
              </p>

              <div className="space-y-2">
                {modalidad.reglas.map((regla) => (
                  <div
                    key={regla.clave}
                    className="grid grid-cols-2 items-end gap-2 rounded-md border border-zinc-100 p-2 sm:grid-cols-12"
                  >
                    <label className="space-y-1 sm:col-span-2">
                      <span className="block text-xs text-zinc-500">Desde</span>
                      <input
                        type="number"
                        min="0.001"
                        step={porPeso ? "0.001" : "1"}
                        value={regla.cantidadDesde}
                        onChange={(evento) =>
                          actualizarRegla(modalidad.clave, regla.clave, {
                            cantidadDesde: evento.target.value,
                          })
                        }
                        className={estilosCampo()}
                      />
                    </label>

                    <label className="space-y-1 sm:col-span-2">
                      <span className="block text-xs text-zinc-500">Hasta</span>
                      <input
                        type="number"
                        min="0.001"
                        step={porPeso ? "0.001" : "1"}
                        value={usaRangoSuperior(regla.tipoPrecio) ? regla.cantidadHasta : ""}
                        disabled={!usaRangoSuperior(regla.tipoPrecio)}
                        onChange={(evento) =>
                          actualizarRegla(modalidad.clave, regla.clave, {
                            cantidadHasta: evento.target.value,
                          })
                        }
                        placeholder="Sin límite"
                        className={estilosCampo(
                          undefined,
                          !usaRangoSuperior(regla.tipoPrecio)
                            ? "disabled:cursor-not-allowed disabled:bg-zinc-50"
                            : undefined,
                        )}
                      />
                    </label>

                    <label className="space-y-1 sm:col-span-3">
                      <span className="block text-xs text-zinc-500">Tipo</span>
                      <select
                        value={regla.tipoPrecio}
                        onChange={(evento) =>
                          actualizarRegla(modalidad.clave, regla.clave, {
                            tipoPrecio: evento.target.value as TipoPrecio,
                          })
                        }
                        className={estilosCampo()}
                      >
                        <option value="UNITARIO">Por unidad</option>
                        <option value="TOTAL">Precio del conjunto</option>
                        <option value="PRESENTACION">Presentación</option>
                      </select>
                    </label>

                    <label className="space-y-1 sm:col-span-3">
                      <span className="block text-xs text-zinc-500">
                        Método de pago
                      </span>
                      <select
                        value={regla.metodoPagoId ?? ""}
                        onChange={(evento) =>
                          actualizarRegla(modalidad.clave, regla.clave, {
                            metodoPagoId: evento.target.value || null,
                          })
                        }
                        className={estilosCampo()}
                      >
                        {opcionesMetodo.map((opcion) => (
                          <option key={opcion.valor} value={opcion.valor}>
                            {opcion.etiqueta}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1 sm:col-span-2">
                      <span className="block text-xs text-zinc-500">Precio</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={regla.precio}
                        onChange={(evento) =>
                          actualizarRegla(modalidad.clave, regla.clave, {
                            precio: evento.target.value,
                          })
                        }
                        className={estilosCampo()}
                      />
                    </label>

                    <div className="flex justify-end sm:col-span-12">
                      <Boton
                        variante="fantasma"
                        tamano="sm"
                        onClick={() => quitarRegla(modalidad.clave, regla.clave)}
                        aria-label="Quitar precio"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      </Boton>
                    </div>
                  </div>
                ))}
              </div>

              <Boton
                variante="secundario"
                tamano="sm"
                onClick={() => agregarRegla(modalidad.clave)}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Agregar precio
              </Boton>
            </div>
          </div>
        );
      })}

      <Boton
        variante="secundario"
        tamano="sm"
        onClick={() =>
          setModalidades((actuales) => [
            ...actuales,
            { ...nuevaModalidad(), esBase: actuales.length === 0 },
          ])
        }
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Agregar modalidad
      </Boton>

      <input type="hidden" name="modalidades" value={serializar(modalidades)} />
    </SeccionFormulario>
  );
}
