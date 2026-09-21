"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import type { CuentaPagoProveedorDetalle } from "@/servicios/proveedores/obtenerProveedor";
import { accionCambiarCuentaPrincipalProveedor } from "@/acciones/proveedores/accionCambiarCuentaPrincipalProveedor";
import { accionCambiarEstadoCuentaPagoProveedor } from "@/acciones/proveedores/accionCambiarEstadoCuentaPagoProveedor";
import { TarjetaCuentaPago } from "@/componentes/proveedores/TarjetaCuentaPago";
import { FormularioCuentaPago } from "@/componentes/proveedores/FormularioCuentaPago";
import { Modal } from "@/componentes/ui/Modal";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import { EstadoVacio } from "@/componentes/ui/EstadoVacio";
import { DialogoConfirmacion } from "@/componentes/ui/DialogoConfirmacion";

export function SeccionDatosPago({
  proveedorId,
  cuentas,
}: {
  proveedorId: string;
  cuentas: CuentaPagoProveedorDetalle[];
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<CuentaPagoProveedorDetalle | null>(
    null,
  );
  const [aDesactivar, setADesactivar] =
    useState<CuentaPagoProveedorDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  function abrirCrear() {
    setEditando(null);
    setModalAbierto(true);
  }

  function abrirEditar(cuenta: CuentaPagoProveedorDetalle) {
    setEditando(cuenta);
    setModalAbierto(true);
  }

  function cambiarPrincipal(cuenta: CuentaPagoProveedorDetalle) {
    iniciarTransicion(async () => {
      const resultado = await accionCambiarCuentaPrincipalProveedor(
        proveedorId,
        cuenta.id,
      );
      setError(resultado.error ?? null);
    });
  }

  function confirmarDesactivar() {
    if (!aDesactivar) return;

    const cuenta = aDesactivar;

    iniciarTransicion(async () => {
      const resultado = await accionCambiarEstadoCuentaPagoProveedor(
        proveedorId,
        cuenta.id,
        false,
      );
      setError(resultado.error ?? null);
      setADesactivar(null);
    });
  }

  function reactivar(cuenta: CuentaPagoProveedorDetalle) {
    iniciarTransicion(async () => {
      const resultado = await accionCambiarEstadoCuentaPagoProveedor(
        proveedorId,
        cuenta.id,
        true,
      );
      setError(resultado.error ?? null);
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-900">Datos de pago</h2>
        <Boton onClick={abrirCrear}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Agregar cuenta de pago
        </Boton>
      </div>

      {error ? <Alerta tono="error">{error}</Alerta> : null}

      {cuentas.length === 0 ? (
        <EstadoVacio
          titulo="Este proveedor todavía no tiene datos de pago."
          descripcion="Registrá una cuenta para poder realizarle pagos."
          accion={
            <Boton onClick={abrirCrear}>
              <Plus className="h-4 w-4" strokeWidth={2} />
              Agregar cuenta de pago
            </Boton>
          }
        />
      ) : (
        <div className="space-y-3">
          {cuentas.map((cuenta) => (
            <TarjetaCuentaPago
              key={cuenta.id}
              cuenta={cuenta}
              onEditar={() => abrirEditar(cuenta)}
              onCambiarPrincipal={() => cambiarPrincipal(cuenta)}
              onAlternarEstado={() =>
                cuenta.activo ? setADesactivar(cuenta) : reactivar(cuenta)
              }
            />
          ))}
        </div>
      )}

      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo={editando ? "Editar cuenta de pago" : "Agregar cuenta de pago"}
        ancho="lg"
      >
        <FormularioCuentaPago
          proveedorId={proveedorId}
          cuenta={editando ?? undefined}
          alCerrar={() => setModalAbierto(false)}
          alExito={() => setModalAbierto(false)}
        />
      </Modal>

      <DialogoConfirmacion
        abierto={aDesactivar !== null}
        alCerrar={() => setADesactivar(null)}
        alConfirmar={confirmarDesactivar}
        titulo="Desactivar cuenta de pago"
        descripcion="Esta cuenta dejará de estar disponible como cuenta principal para nuevos pagos. Seguirá visible en el historial del proveedor."
        textoConfirmar="Desactivar"
        cargando={pendiente}
      />
    </section>
  );
}
