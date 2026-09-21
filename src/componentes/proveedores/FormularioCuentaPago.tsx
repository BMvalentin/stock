"use client";

import { useActionState, useEffect, useState } from "react";
import { accionCrearCuentaPagoProveedor } from "@/acciones/proveedores/accionCrearCuentaPagoProveedor";
import { accionActualizarCuentaPagoProveedor } from "@/acciones/proveedores/accionActualizarCuentaPagoProveedor";
import {
  ESTADO_FORMULARIO_INICIAL,
  type EstadoFormulario,
} from "@/tipos/formulario";
import { METODOS_PAGO_PROVEEDOR, ETIQUETAS_METODO_PAGO_PROVEEDOR } from "@/constantes/metodosPagoProveedor";
import { TIPOS_CUENTA_PROVEEDOR, ETIQUETAS_TIPO_CUENTA_PROVEEDOR } from "@/constantes/tiposCuentaProveedor";
import { CampoTexto } from "@/componentes/ui/CampoTexto";
import { CampoSelect } from "@/componentes/ui/CampoSelect";
import { CampoCheckbox } from "@/componentes/ui/CampoCheckbox";
import { Boton } from "@/componentes/ui/Boton";
import { Alerta } from "@/componentes/ui/Alerta";
import type { CuentaPagoProveedorDetalle } from "@/servicios/proveedores/obtenerProveedor";
import type { MetodoPagoProveedor } from "@/generated/prisma/enums";

const OPCIONES_METODO = METODOS_PAGO_PROVEEDOR.map((metodo) => ({
  valor: metodo,
  etiqueta: ETIQUETAS_METODO_PAGO_PROVEEDOR[metodo],
}));

const OPCIONES_TIPO_CUENTA = TIPOS_CUENTA_PROVEEDOR.map((tipo) => ({
  valor: tipo,
  etiqueta: ETIQUETAS_TIPO_CUENTA_PROVEEDOR[tipo],
}));

export function FormularioCuentaPago({
  proveedorId,
  cuenta,
  alCerrar,
  alExito,
}: {
  proveedorId: string;
  cuenta?: CuentaPagoProveedorDetalle;
  alCerrar: () => void;
  alExito: () => void;
}) {
  const [metodo, setMetodo] = useState<MetodoPagoProveedor>(
    cuenta?.metodoPago ?? "TRANSFERENCIA_BANCARIA",
  );

  const accion = cuenta
    ? accionActualizarCuentaPagoProveedor.bind(null, proveedorId, cuenta.id)
    : accionCrearCuentaPagoProveedor.bind(null, proveedorId);

  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(
    accion,
    ESTADO_FORMULARIO_INICIAL,
  );

  useEffect(() => {
    if (estado.exito) alExito();
  }, [estado.exito, alExito]);

  const esEfectivo = metodo === "EFECTIVO";
  const esMercadoPago = metodo === "MERCADO_PAGO";
  const mostrarCbu = metodo === "TRANSFERENCIA_BANCARIA" || metodo === "OTRO";
  const mostrarCvu =
    metodo === "TRANSFERENCIA_CVU" ||
    metodo === "MERCADO_PAGO" ||
    metodo === "OTRO";
  const mostrarDatosBancarios = !esEfectivo;
  const mostrarBanco = mostrarDatosBancarios && !esMercadoPago;

  return (
    <form action={enviar} className="space-y-4">
      {estado.error ? <Alerta tono="error">{estado.error}</Alerta> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect
          etiqueta="Medio de pago"
          name="metodoPago"
          requerido
          opciones={OPCIONES_METODO}
          value={metodo}
          onChange={(evento) =>
            setMetodo(evento.target.value as MetodoPagoProveedor)
          }
        />
        <CampoSelect
          etiqueta="Tipo de cuenta"
          name="tipoCuenta"
          marcador="Sin especificar"
          opciones={OPCIONES_TIPO_CUENTA}
          defaultValue={cuenta?.tipoCuenta ?? ""}
          ayuda="Opcional según el medio de pago."
          error={estado.errores?.tipoCuenta?.[0]}
        />
      </div>

      {mostrarDatosBancarios ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto
            etiqueta="Alias"
            name="alias"
            defaultValue={cuenta?.alias ?? ""}
            ayuda="Por ejemplo: proveedor.mp"
            error={estado.errores?.alias?.[0]}
          />
          {mostrarCbu ? (
            <CampoTexto
              etiqueta="CBU"
              name="cbu"
              inputMode="numeric"
              defaultValue={cuenta?.cbu ?? ""}
              ayuda="22 dígitos."
              error={estado.errores?.cbu?.[0]}
            />
          ) : null}
          {mostrarCvu ? (
            <CampoTexto
              etiqueta="CVU"
              name="cvu"
              inputMode="numeric"
              defaultValue={cuenta?.cvu ?? ""}
              ayuda="22 dígitos."
              error={estado.errores?.cvu?.[0]}
            />
          ) : null}
          {mostrarBanco ? (
            <CampoTexto
              etiqueta="Banco"
              name="banco"
              defaultValue={cuenta?.banco ?? ""}
              error={estado.errores?.banco?.[0]}
            />
          ) : null}
        </div>
      ) : (
        <Alerta tono="info">
          El pago en efectivo no requiere datos bancarios.
        </Alerta>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto
          etiqueta="Nombre del titular"
          name="titular"
          defaultValue={cuenta?.titular ?? ""}
          error={estado.errores?.titular?.[0]}
        />
        <CampoTexto
          etiqueta="CUIT/CUIL del titular"
          name="titularCuit"
          inputMode="numeric"
          defaultValue={cuenta?.titularCuit ?? ""}
          ayuda="11 dígitos."
          error={estado.errores?.titularCuit?.[0]}
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <CampoCheckbox
          etiqueta="Cuenta activa"
          name="activo"
          value="true"
          defaultChecked={cuenta ? cuenta.activo : true}
        />
        <CampoCheckbox
          etiqueta="Cuenta principal"
          name="esPrincipal"
          value="true"
          defaultChecked={cuenta?.esPrincipal ?? false}
        />
      </div>
      {estado.errores?.activo?.[0] ? (
        <p className="text-xs text-red-600">{estado.errores.activo[0]}</p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Boton variante="secundario" onClick={alCerrar} disabled={pendiente}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={pendiente}>
          {cuenta ? "Guardar cambios" : "Agregar cuenta"}
        </Boton>
      </div>
    </form>
  );
}
