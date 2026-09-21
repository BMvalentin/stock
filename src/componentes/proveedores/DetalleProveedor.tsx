"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Pencil, Phone, Power } from "lucide-react";
import type { ProveedorDetalle } from "@/servicios/proveedores/obtenerProveedor";
import { accionCambiarEstadoProveedor } from "@/acciones/proveedores/accionCambiarEstadoProveedor";
import { enlaceWhatsApp } from "@/lib/utilidades/enlaceWhatsApp";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Boton } from "@/componentes/ui/Boton";
import { Modal } from "@/componentes/ui/Modal";
import { Alerta } from "@/componentes/ui/Alerta";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import { Dato } from "@/componentes/ui/Dato";
import { SeccionDatosPago } from "@/componentes/proveedores/SeccionDatosPago";
import { formatearCuit } from "@/lib/utilidades/formatearCuit";
import {
  FormularioProveedor,
  type ProveedorFormulario,
} from "@/componentes/proveedores/FormularioProveedor";

export function DetalleProveedor({
  proveedor,
  esAdmin,
}: {
  proveedor: ProveedorDetalle;
  esAdmin: boolean;
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, iniciarTransicion] = useTransition();

  function alternarEstado() {
    iniciarTransicion(async () => {
      const resultado = await accionCambiarEstadoProveedor(
        proveedor.id,
        !proveedor.activo,
      );
      setError(resultado.error ?? null);
    });
  }

  const formulario: ProveedorFormulario = {
    id: proveedor.id,
    nombre: proveedor.nombre,
    empresa: proveedor.empresa,
    cuit: proveedor.cuit,
    telefono: proveedor.telefono,
    whatsapp: proveedor.whatsapp,
    email: proveedor.email,
    direccion: proveedor.direccion,
    notas: proveedor.notas,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {proveedor.whatsapp ? (
          <a
            href={enlaceWhatsApp(proveedor.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
            WhatsApp
          </a>
        ) : null}
        {proveedor.telefono ? (
          <a
            href={`tel:${proveedor.telefono}`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <Phone className="h-4 w-4" strokeWidth={1.75} />
            Llamar
          </a>
        ) : null}
        {proveedor.email ? (
          <a
            href={`mailto:${proveedor.email}`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <Mail className="h-4 w-4" strokeWidth={1.75} />
            Enviar correo
          </a>
        ) : null}

        {esAdmin ? (
          <div className="ml-auto flex items-center gap-2">
            <Boton variante="secundario" onClick={() => setModalAbierto(true)}>
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
              Editar
            </Boton>
            <Boton
              variante={proveedor.activo ? "secundario" : "primario"}
              onClick={alternarEstado}
            >
              <Power className="h-4 w-4" strokeWidth={1.75} />
              {proveedor.activo ? "Desactivar" : "Reactivar"}
            </Boton>
          </div>
        ) : null}
      </div>

      {error ? <Alerta tono="error">{error}</Alerta> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Tarjeta className="p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Datos</h2>
            <Etiqueta tono={proveedor.activo ? "exito" : "neutral"}>
              {proveedor.activo ? "Activo" : "Inactivo"}
            </Etiqueta>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <Dato etiqueta="Nombre" valor={proveedor.nombre} />
            <Dato etiqueta="Empresa" valor={proveedor.empresa} />
            <Dato
              etiqueta="CUIT/CUIL"
              valor={formatearCuit(proveedor.cuit) || null}
            />
            <Dato etiqueta="Teléfono" valor={proveedor.telefono} />
            <Dato etiqueta="WhatsApp" valor={proveedor.whatsapp} />
            <Dato etiqueta="Correo" valor={proveedor.email} />
            <Dato etiqueta="Dirección" valor={proveedor.direccion} />
            <Dato etiqueta="Notas" valor={proveedor.notas} />
          </dl>
        </Tarjeta>

        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-900">
            Productos asociados
          </h2>
          {proveedor.productos.length === 0 ? (
            <EstadoVacio
              titulo="Sin productos asociados"
              descripcion="Asociá productos desde el formulario de cada producto."
            />
          ) : (
            <TablaDatos
              columnas={[
                { encabezado: "Producto" },
                { encabezado: "SKU" },
                { encabezado: "Stock", alineacion: "der" },
                { encabezado: "Principal", alineacion: "centro" },
              ]}
              filas={proveedor.productos.map((producto) => ({
                id: producto.id,
                celdas: [
                  <Link
                    key="nombre"
                    href={`/admin/productos/${producto.id}`}
                    className="font-medium text-zinc-900 hover:underline"
                  >
                    {producto.nombre}
                  </Link>,
                  <span key="sku" className="text-zinc-500">
                    {producto.sku}
                  </span>,
                  <span key="stock">{producto.stockActual}</span>,
                  <span key="principal">
                    {producto.esPrincipal ? (
                      <Etiqueta tono="info">Principal</Etiqueta>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </span>,
                ],
              }))}
            />
          )}
        </div>
      </div>

      {esAdmin ? (
        <SeccionDatosPago
          proveedorId={proveedor.id}
          cuentas={proveedor.cuentasPago}
        />
      ) : null}

      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo="Editar proveedor"
        ancho="lg"
      >
        <FormularioProveedor
          proveedor={formulario}
          alCerrar={() => setModalAbierto(false)}
          alExito={() => setModalAbierto(false)}
        />
      </Modal>
    </div>
  );
}
