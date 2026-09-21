"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { accionCrearProducto } from "@/acciones/productos/accionCrearProducto";
import { accionActualizarProducto } from "@/acciones/productos/accionActualizarProducto";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import type { ProductoDetalle } from "@/servicios/productos/obtenerProducto";
import type { MetodoPagoActivo } from "@/servicios/metodosPago/listarMetodosPagoActivos";
import type { OpcionCampo } from "@/componentes/ui/CampoSelect";
import {
  ETIQUETAS_UNIDAD_VENTA,
  UNIDADES_VENTA,
} from "@/constantes/unidadesVenta";
import { formatearStockPresentacion } from "@/lib/utilidades/formatearStockPresentacion";
import { SeccionFormulario } from "@/componentes/ui/SeccionFormulario";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { CampoSelect } from "@/componentes/ui/CampoSelect";
import { CampoTextarea } from "@/componentes/ui/CampoTextarea";
import { CampoCheckbox } from "@/componentes/ui/CampoCheckbox";
import { CampoImagenProducto } from "@/componentes/productos/CampoImagenProducto";
import { CampoBarcode } from "@/componentes/productos/CampoBarcode";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { Etiqueta } from "@/componentes/ui/Etiqueta";

export function FormularioProducto({
  producto,
  barcodeInicial,
  categorias,
  metodosPago,
  proveedores,
  moneda,
  locale,
}: {
  producto?: ProductoDetalle;
  barcodeInicial?: string;
  categorias: OpcionCampo[];
  metodosPago: MetodoPagoActivo[];
  proveedores: OpcionCampo[];
  moneda: string;
  locale: string;
}) {
  const router = useRouter();
  const esEdicion = Boolean(producto);
  const [unidadVenta, setUnidadVenta] = useState<"UNIDAD" | "KILOGRAMO">(
    producto?.unidadVenta ?? "UNIDAD",
  );
  const [permiteVentaSuelta, setPermiteVentaSuelta] = useState(
    producto?.permiteVentaSuelta ?? false,
  );
  const accion = producto
    ? accionActualizarProducto.bind(null, producto.id)
    : accionCrearProducto;
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accion,
    ESTADO_FORMULARIO_INICIAL,
  );

  useEffect(() => {
    if (estado.exito) {
      router.push(estado.redirigir ?? "/admin/productos");
      router.refresh();
    }
  }, [estado.exito, estado.redirigir, router]);

  const precioPorMetodo = new Map(
    (producto?.precios ?? []).map((precio) => [
      precio.metodoPagoId,
      precio.precio,
    ]),
  );
  const precioSueltoPorMetodo = new Map(
    (producto?.preciosSuelto ?? []).map((precio) => [
      precio.metodoPagoId,
      precio.precio,
    ]),
  );
  const proveedoresSeleccionados = new Set(
    (producto?.proveedores ?? []).map((proveedor) => proveedor.id),
  );
  const principalId = producto?.proveedores.find(
    (proveedor) => proveedor.esPrincipal,
  )?.id;

  return (
    <form action={enviar} className="space-y-6">
      {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}

      <SeccionFormulario titulo="Información básica">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto
            etiqueta="Nombre"
            name="nombre"
            defaultValue={producto?.nombre ?? ""}
            requerido
            error={estado.errores?.nombre?.[0]}
          />
          <CampoTexto
            etiqueta="SKU"
            name="sku"
            defaultValue={producto?.sku ?? ""}
            ayuda="Opcional."
            error={estado.errores?.sku?.[0]}
          />
        </div>
        <CampoSelect
          etiqueta="Categoría"
          name="categoriaId"
          opciones={categorias}
          marcador="Seleccioná una categoría"
          defaultValue={producto?.categoriaId ?? ""}
          requerido
          error={estado.errores?.categoriaId?.[0]}
        />
        <CampoSelect
          etiqueta="Modalidad de venta"
          name="unidadVenta"
          value={unidadVenta}
          onChange={(evento) => {
            const valor = evento.target.value as "UNIDAD" | "KILOGRAMO";
            setUnidadVenta(valor);
            if (valor !== "UNIDAD") setPermiteVentaSuelta(false);
          }}
          opciones={UNIDADES_VENTA.map((unidad) => ({
            valor: unidad,
            etiqueta: ETIQUETAS_UNIDAD_VENTA[unidad],
          }))}
          requerido
          ayuda="Define cómo se interpreta el precio: por unidad/presentación o por kilogramo."
          error={estado.errores?.unidadVenta?.[0]}
        />
        <CampoTextarea
          etiqueta="Descripción"
          name="descripcion"
          rows={3}
          defaultValue={producto?.descripcion ?? ""}
          error={estado.errores?.descripcion?.[0]}
        />
      </SeccionFormulario>

      <SeccionFormulario
        titulo="Código de barras"
        descripcion="Escaneá el código del producto o ingresalo manualmente."
      >
        <CampoBarcode
          valorInicial={producto?.barcode ?? barcodeInicial}
          error={estado.errores?.barcode?.[0]}
          moneda={moneda}
          locale={locale}
        />
      </SeccionFormulario>

      <SeccionFormulario
        titulo="Imagen del producto"
        descripcion="Imagen de referencia opcional para identificar el producto."
      >
        <CampoImagenProducto
          imagenActual={producto?.imageUrl}
          error={estado.errores?.imagen?.[0]}
        />
      </SeccionFormulario>

      <SeccionFormulario
        titulo="Precios y venta"
        descripcion={
          unidadVenta === "KILOGRAMO"
            ? "Un precio por kilogramo para cada método de pago activo."
            : "Un precio por bulto para cada método de pago activo."
        }
      >
        {metodosPago.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No hay métodos de pago activos. Configuralos en Configuración.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {metodosPago.map((metodo) => (
                <CampoTexto
                  key={metodo.id}
                  etiqueta={
                    unidadVenta === "KILOGRAMO"
                      ? `Precio por kg · ${metodo.nombre}`
                      : `Precio por bulto · ${metodo.nombre}`
                  }
                  name={`precio_${metodo.id}`}
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={precioPorMetodo.get(metodo.id) ?? ""}
                  error={estado.errores?.[`precio_${metodo.id}`]?.[0]}
                />
              ))}
            </div>

            {unidadVenta === "UNIDAD" ? (
              <div className="space-y-4 rounded-md border border-zinc-200 p-4">
                <CampoCheckbox
                  etiqueta="Permitir venta suelta por kg"
                  name="permiteVentaSuelta"
                  checked={permiteVentaSuelta}
                  onChange={(evento) =>
                    setPermiteVentaSuelta(evento.target.checked)
                  }
                  error={estado.errores?.permiteVentaSuelta?.[0]}
                />
                <p className="text-xs text-zinc-500">
                  El stock de este producto se lleva en kilogramos. Cada bolsa
                  descuenta su peso de presentación.
                </p>

                {permiteVentaSuelta ? (
                  <>
                    <CampoTexto
                      etiqueta="Peso de la presentación (kg)"
                      name="pesoPresentacionKg"
                      type="number"
                      min="0.001"
                      step="0.001"
                      defaultValue={producto?.pesoPresentacionKg ?? ""}
                      ayuda="Ej.: 15 para una bolsa de 15 kg."
                      requerido
                      error={estado.errores?.pesoPresentacionKg?.[0]}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      {metodosPago.map((metodo) => (
                        <CampoTexto
                          key={metodo.id}
                          etiqueta={`Precio por kg · ${metodo.nombre}`}
                          name={`precioSuelto_${metodo.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={
                            precioSueltoPorMetodo.get(metodo.id) ?? ""
                          }
                          requerido
                          error={
                            estado.errores?.[`precioSuelto_${metodo.id}`]?.[0]
                          }
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </SeccionFormulario>

      <SeccionFormulario titulo="Stock">
        <div
          className={`grid gap-4 ${
            permiteVentaSuelta ? "sm:grid-cols-2" : "sm:grid-cols-3"
          }`}
        >
          <CampoTexto
            etiqueta={
              permiteVentaSuelta ? "Stock mínimo (kg)" : "Stock mínimo"
            }
            name="stockMinimo"
            type="number"
            min="0"
            step="0.001"
            defaultValue={producto?.stockMinimo ?? 0}
            requerido
            error={estado.errores?.stockMinimo?.[0]}
          />
          {!permiteVentaSuelta ? (
            <CampoTexto
              etiqueta="Unidades por bulto"
              name="unidadesPorBulto"
              type="number"
              min="1"
              step="1"
              defaultValue={producto?.unidadesPorBulto ?? 1}
              requerido
              error={estado.errores?.unidadesPorBulto?.[0]}
            />
          ) : (
            <input type="hidden" name="unidadesPorBulto" value={1} />
          )}
          {esEdicion ? (
            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-zinc-700">
                Stock actual
              </span>
              <div className="flex h-9 items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700">
                {permiteVentaSuelta
                  ? formatearStockPresentacion(
                      producto?.stockActual ?? 0,
                      producto?.pesoPresentacionKg,
                    )
                  : (producto?.stockActual ?? 0)}
              </div>
              <p className="text-xs text-zinc-500">
                Se ajusta desde Stock con un movimiento.
              </p>
            </div>
          ) : (
            <CampoTexto
              etiqueta={permiteVentaSuelta ? "Stock inicial (kg)" : "Stock inicial"}
              name="stockInicial"
              type="number"
              min="0"
              step="0.001"
              defaultValue={0}
              ayuda="Genera un movimiento de ingreso."
            />
          )}
        </div>
      </SeccionFormulario>

      <SeccionFormulario titulo="Proveedores">
        {proveedores.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No hay proveedores activos. Creá uno en Proveedores.
          </p>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              {proveedores.map((proveedor) => (
                <CampoCheckbox
                  key={proveedor.valor}
                  etiqueta={proveedor.etiqueta}
                  name="proveedorIds"
                  value={proveedor.valor}
                  defaultChecked={proveedoresSeleccionados.has(
                    proveedor.valor,
                  )}
                />
              ))}
            </div>
            <CampoSelect
              etiqueta="Proveedor principal"
              name="proveedorPrincipalId"
              opciones={proveedores}
              marcador="Sin proveedor principal"
              defaultValue={principalId ?? ""}
              ayuda="Debe estar entre los proveedores seleccionados."
            />
          </>
        )}
      </SeccionFormulario>

      {esEdicion ? (
        <SeccionFormulario titulo="Estado">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Etiqueta tono={producto?.activo ? "exito" : "neutral"}>
              {producto?.activo ? "Activo" : "Inactivo"}
            </Etiqueta>
            <span>
              El estado se cambia desde el listado o el detalle del producto.
            </span>
          </div>
        </SeccionFormulario>
      ) : null}

      <div className="flex justify-end gap-2">
        <Boton
          variante="secundario"
          type="button"
          onClick={() => router.back()}
          disabled={pendiente}
        >
          Cancelar
        </Boton>
        <Boton type="submit" cargando={pendiente}>
          {esEdicion ? "Guardar cambios" : "Crear producto"}
        </Boton>
      </div>
    </form>
  );
}
