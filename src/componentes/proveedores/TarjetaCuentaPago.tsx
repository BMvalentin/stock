import { Pencil, Power, Star } from "lucide-react";
import type { CuentaPagoProveedorDetalle } from "@/servicios/proveedores/obtenerProveedor";
import { ETIQUETAS_METODO_PAGO_PROVEEDOR } from "@/constantes/metodosPagoProveedor";
import { ETIQUETAS_TIPO_CUENTA_PROVEEDOR } from "@/constantes/tiposCuentaProveedor";
import { enmascararCuentaBancaria } from "@/lib/utilidades/enmascararCuentaBancaria";
import { formatearCuit } from "@/lib/utilidades/formatearCuit";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Boton } from "@/componentes/ui/Boton";
import { Dato } from "@/componentes/ui/Dato";

export function TarjetaCuentaPago({
  cuenta,
  onEditar,
  onCambiarPrincipal,
  onAlternarEstado,
}: {
  cuenta: CuentaPagoProveedorDetalle;
  onEditar: () => void;
  onCambiarPrincipal: () => void;
  onAlternarEstado: () => void;
}) {
  const cuitFormateado = formatearCuit(cuenta.titularCuit);
  const cbuEnmascarado = enmascararCuentaBancaria(cuenta.cbu);
  const cvuEnmascarado = enmascararCuentaBancaria(cuenta.cvu);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-900">
              {ETIQUETAS_METODO_PAGO_PROVEEDOR[cuenta.metodoPago]}
            </h3>
            {cuenta.esPrincipal ? (
              <Etiqueta tono="info">
                <Star className="mr-1 h-3 w-3" strokeWidth={2} />
                Principal
              </Etiqueta>
            ) : null}
            {!cuenta.activo ? <Etiqueta tono="neutral">Inactiva</Etiqueta> : null}
          </div>
          {cuenta.tipoCuenta ? (
            <p className="text-xs text-zinc-500">
              {ETIQUETAS_TIPO_CUENTA_PROVEEDOR[cuenta.tipoCuenta]}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {cuenta.activo && !cuenta.esPrincipal ? (
            <Boton variante="secundario" onClick={onCambiarPrincipal}>
              <Star className="h-4 w-4" strokeWidth={1.75} />
              Establecer como principal
            </Boton>
          ) : null}
          <Boton variante="secundario" onClick={onEditar}>
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
            Editar
          </Boton>
          <Boton
            variante={cuenta.activo ? "secundario" : "primario"}
            onClick={onAlternarEstado}
          >
            <Power className="h-4 w-4" strokeWidth={1.75} />
            {cuenta.activo ? "Desactivar" : "Reactivar"}
          </Boton>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Dato etiqueta="Banco" valor={cuenta.banco} />
        <Dato etiqueta="Titular" valor={cuenta.titular} />
        <Dato etiqueta="CUIT/CUIL" valor={cuitFormateado || null} />
        <Dato etiqueta="Alias" valor={cuenta.alias} />
        {cbuEnmascarado ? (
          <Dato etiqueta="CBU" valor={cbuEnmascarado} />
        ) : null}
        {cvuEnmascarado ? (
          <Dato etiqueta="CVU" valor={cvuEnmascarado} />
        ) : null}
      </dl>
    </div>
  );
}
