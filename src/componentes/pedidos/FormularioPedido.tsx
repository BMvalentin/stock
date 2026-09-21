"use client";

import { useEffect, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { accionCrearPedido } from "@/acciones/pedidos/accionCrearPedido";
import { accionCalcularResumenPedido } from "@/acciones/pedidos/accionCalcularResumenPedido";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import type {
  LineaPedidoUI,
  ResumenPedidoCalculado,
} from "@/tipos/pedidoFormulario";
import type { ProductoParaPedido } from "@/servicios/productos/buscarProductosParaPedido";
import type { MetodoPagoActivo } from "@/servicios/metodosPago/listarMetodosPagoActivos";
import type { TipoEntrega } from "@/generated/prisma/enums";
import { SeccionFormulario } from "@/componentes/ui/SeccionFormulario";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { CampoSelect } from "@/componentes/ui/CampoSelect";
import { CampoTextarea } from "@/componentes/ui/CampoTextarea";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { BuscadorProductoPedido } from "@/componentes/pedidos/BuscadorProductoPedido";
import { LineasPedido } from "@/componentes/pedidos/LineasPedido";
import { ResumenPedido } from "@/componentes/pedidos/ResumenPedido";
import { CampoUbicacionMaps } from "@/componentes/pedidos/CampoUbicacionMaps";

export function FormularioPedido({
  metodosPago,
  moneda,
  locale,
}: {
  metodosPago: MetodoPagoActivo[];
  moneda: string;
  locale: string;
}) {
  const router = useRouter();
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accionCrearPedido,
    ESTADO_FORMULARIO_INICIAL,
  );

  const [tipoEntrega, setTipoEntrega] =
    useState<TipoEntrega>("ENVIO_DOMICILIO");
  const [metodoPagoId, setMetodoPagoId] = useState(
    metodosPago[0]?.id ?? "",
  );
  const [direccion, setDireccion] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [lineas, setLineas] = useState<LineaPedidoUI[]>([]);

  const [resumen, setResumen] = useState<ResumenPedidoCalculado | null>(null);
  const [calculandoResumen, setCalculandoResumen] = useState(false);
  const [errorResumen, setErrorResumen] = useState<string | null>(null);

  useEffect(() => {
    if (estado.exito) {
      router.push(estado.redirigir ?? "/pedidos");
      router.refresh();
    }
  }, [estado.exito, estado.redirigir, router]);

  useEffect(() => {
    let cancelado = false;

    async function calcular() {
      await Promise.resolve();
      if (cancelado) return;

      if (lineas.length === 0) {
        setResumen(null);
        setErrorResumen(null);
        setCalculandoResumen(false);
        return;
      }

      if (!metodoPagoId) {
        setResumen(null);
        setErrorResumen("Seleccioná un método de pago.");
        setCalculandoResumen(false);
        return;
      }

      setCalculandoResumen(true);

      const respuesta = await accionCalcularResumenPedido(
        lineas.map((linea) => ({
          productoId: linea.productoId,
          cantidad: linea.cantidad,
        })),
        metodoPagoId,
        tipoEntrega,
      );

      if (cancelado) return;
      setCalculandoResumen(false);

      if (respuesta.ok) {
        setResumen(respuesta.resumen);
        setErrorResumen(null);
      } else {
        setResumen(null);
        setErrorResumen(respuesta.error);
      }
    }

    const temporizador = setTimeout(calcular, 250);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [lineas, metodoPagoId, tipoEntrega]);

  function agregarProducto(producto: ProductoParaPedido) {
    setLineas((actuales) => {
      const existente = actuales.find(
        (linea) => linea.productoId === producto.id,
      );

      if (existente) {
        return actuales.map((linea) =>
          linea.productoId === producto.id
            ? { ...linea, cantidad: linea.cantidad + 1 }
            : linea,
        );
      }

      return [
        ...actuales,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          sku: producto.sku,
          unidadVenta: producto.unidadVenta,
          cantidad: 1,
          precios: producto.precios,
          stockActual: producto.stockActual,
        },
      ];
    });
  }

  function cambiarCantidad(productoId: string, cantidad: number) {
    setLineas((actuales) =>
      actuales.map((linea) =>
        linea.productoId === productoId
          ? {
              ...linea,
              cantidad: Number.isFinite(cantidad) ? Math.max(0, cantidad) : 0,
            }
          : linea,
      ),
    );
  }

  function quitarProducto(productoId: string) {
    setLineas((actuales) =>
      actuales.filter((linea) => linea.productoId !== productoId),
    );
  }

  const esEnvio = tipoEntrega === "ENVIO_DOMICILIO";
  const sinMetodos = metodosPago.length === 0;

  return (
    <form action={enviar} className="space-y-6">
      {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}
      {sinMetodos ? (
        <Alerta tono="advertencia">
          No hay métodos de pago activos. Configuralos antes de crear un pedido.
        </Alerta>
      ) : null}

      <SeccionFormulario titulo="Datos del cliente">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto
            etiqueta="Nombre"
            name="clienteNombre"
            requerido
            autoComplete="off"
            error={estado.errores?.clienteNombre?.[0]}
          />
          <CampoTexto
            etiqueta="Teléfono"
            name="clienteTelefono"
            requerido
            autoComplete="off"
            inputMode="tel"
            placeholder="223 555 1234"
            error={estado.errores?.clienteTelefono?.[0]}
          />
        </div>
      </SeccionFormulario>

      <SeccionFormulario titulo="Datos de entrega">
        <CampoSelect
          etiqueta="Tipo de entrega"
          name="tipoEntrega"
          value={tipoEntrega}
          onChange={(evento) =>
            setTipoEntrega(evento.target.value as TipoEntrega)
          }
          opciones={[
            { valor: "ENVIO_DOMICILIO", etiqueta: "Envío a domicilio" },
            { valor: "RETIRO", etiqueta: "Retiro en el local" },
          ]}
          requerido
        />

        {esEnvio ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto
                etiqueta="Dirección"
                name="direccion"
                value={direccion}
                onChange={(evento) => setDireccion(evento.target.value)}
                requerido
                autoComplete="off"
                placeholder="Av. Constitución 1234"
                error={estado.errores?.direccion?.[0]}
              />
              <CampoTexto
                etiqueta="Localidad"
                name="localidad"
                value={localidad}
                onChange={(evento) => setLocalidad(evento.target.value)}
                requerido
                autoComplete="off"
                placeholder="Mar del Plata"
                error={estado.errores?.localidad?.[0]}
              />
            </div>

            <CampoTexto
              etiqueta="Referencia (opcional)"
              name="referencia"
              autoComplete="off"
              placeholder="Casa con rejas negras"
              ayuda="Ayuda al repartidor a ubicar el domicilio."
              error={estado.errores?.referencia?.[0]}
            />

            <CampoUbicacionMaps
              direccion={direccion}
              localidad={localidad}
              mapsUrl={mapsUrl}
              onCambiarMapsUrl={setMapsUrl}
              latitud={latitud}
              longitud={longitud}
              onCambiarLatitud={setLatitud}
              onCambiarLongitud={setLongitud}
              errorMapsUrl={estado.errores?.mapsUrl?.[0]}
              errorLatitud={estado.errores?.latitud?.[0]}
              errorLongitud={estado.errores?.longitud?.[0]}
            />
          </>
        ) : (
          <p className="text-sm text-zinc-500">
            El cliente retira en el local. No hace falta cargar dirección.
          </p>
        )}
      </SeccionFormulario>

      <SeccionFormulario titulo="Productos">
        <BuscadorProductoPedido
          onSeleccionar={agregarProducto}
          metodoPagoId={metodoPagoId}
          moneda={moneda}
          locale={locale}
        />
        {estado.errores?.lineas?.[0] ? (
          <Alerta tono="error">{estado.errores.lineas[0]}</Alerta>
        ) : null}
        <LineasPedido
          lineas={lineas}
          metodoPagoId={metodoPagoId}
          moneda={moneda}
          locale={locale}
          onCambiarCantidad={cambiarCantidad}
          onQuitar={quitarProducto}
        />
      </SeccionFormulario>

      <SeccionFormulario titulo="Pago y resumen">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoSelect
            etiqueta="Método de pago"
            name="metodoPagoId"
            value={metodoPagoId}
            onChange={(evento) => setMetodoPagoId(evento.target.value)}
            opciones={metodosPago.map((metodo) => ({
              valor: metodo.id,
              etiqueta: metodo.nombre,
            }))}
            marcador="Seleccioná un método"
            requerido
            error={estado.errores?.metodoPagoId?.[0]}
          />
          <CampoTextarea
            etiqueta="Observaciones (opcional)"
            name="observaciones"
            rows={2}
            error={estado.errores?.observaciones?.[0]}
          />
        </div>

        <ResumenPedido
          resumen={resumen}
          calculando={calculandoResumen}
          error={errorResumen}
          moneda={moneda}
          locale={locale}
        />
      </SeccionFormulario>

      <input
        type="hidden"
        name="lineas"
        value={JSON.stringify(
          lineas.map((linea) => ({
            productoId: linea.productoId,
            cantidad: linea.cantidad,
          })),
        )}
      />

      <div className="flex justify-end gap-2">
        <Boton
          variante="secundario"
          type="button"
          onClick={() => router.back()}
          disabled={pendiente}
        >
          Cancelar
        </Boton>
        <Boton
          type="submit"
          cargando={pendiente}
          disabled={sinMetodos || lineas.length === 0}
        >
          Crear pedido
        </Boton>
      </div>
    </form>
  );
}
