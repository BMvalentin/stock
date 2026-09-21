"use client";

import { useState, useTransition } from "react";
import { Plus, ShieldCheck, UserCog, UserX, Wallet } from "lucide-react";
import type { EmpleadoListado } from "@/servicios/empleados/listarEmpleados";
import { accionCambiarRolEmpleado } from "@/acciones/empleados/accionCambiarRolEmpleado";
import { accionCambiarEstadoEmpleado } from "@/acciones/empleados/accionCambiarEstadoEmpleado";
import { ETIQUETAS_ROL } from "@/constantes/roles";
import { ETIQUETAS_TIPO_REMUNERACION } from "@/constantes/tiposRemuneracion";
import { formatearFecha } from "@/lib/utilidades/formatearFecha";
import type { Rol } from "@/generated/prisma/enums";
import { TablaDatos } from "@/componentes/tablas/TablaDatos";
import { MenuAcciones } from "@/componentes/ui/MenuAcciones";
import { Etiqueta } from "@/componentes/ui/Etiqueta";
import { Boton } from "@/componentes/ui/Boton";
import { Modal } from "@/componentes/ui/Modal";
import { Alerta } from "@/componentes/ui/Alerta";
import { DialogoConfirmacion } from "@/componentes/ui/DialogoConfirmacion";
import { FormularioEmpleado } from "@/componentes/empleados/FormularioEmpleado";

export function TablaEmpleados({
  empleados,
  usuarioActualId,
  locale,
}: {
  empleados: EmpleadoListado[];
  usuarioActualId: string;
  locale: string;
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cambioRol, setCambioRol] = useState<{
    empleado: EmpleadoListado;
    nuevoRol: Rol;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  function confirmarCambioRol() {
    if (!cambioRol) return;

    iniciarTransicion(async () => {
      const resultado = await accionCambiarRolEmpleado(
        cambioRol.empleado.id,
        cambioRol.nuevoRol,
      );
      setError(resultado.error ?? null);
      setCambioRol(null);
    });
  }

  function alternarEstado(empleado: EmpleadoListado) {
    iniciarTransicion(async () => {
      const resultado = await accionCambiarEstadoEmpleado(
        empleado.id,
        !empleado.activo,
      );
      setError(resultado.error ?? null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Boton onClick={() => setModalAbierto(true)}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nuevo empleado
        </Boton>
      </div>

      {error ? <Alerta tono="error">{error}</Alerta> : null}

      <TablaDatos
        columnas={[
          { encabezado: "Empleado" },
          { encabezado: "Rol" },
          { encabezado: "Remuneración" },
          { encabezado: "Alta" },
          { encabezado: "Estado" },
          { encabezado: "", alineacion: "der" },
        ]}
        filas={empleados.map((empleado) => {
          const esUnoMismo = empleado.id === usuarioActualId;
          const rolAlternativo: Rol =
            empleado.rol === "ADMIN" ? "EMPLEADO" : "ADMIN";

          return {
            id: empleado.id,
            celdas: [
              <div key="empleado" className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {empleado.nombre ?? "Sin nombre"}
                  {esUnoMismo ? (
                    <span className="ml-2 text-xs font-normal text-zinc-400">
                      (vos)
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {empleado.email}
                </p>
              </div>,
              <Etiqueta
                key="rol"
                tono={empleado.rol === "ADMIN" ? "info" : "neutral"}
              >
                {ETIQUETAS_ROL[empleado.rol]}
              </Etiqueta>,
              <span key="remuneracion" className="text-xs text-zinc-600">
                {empleado.tipoRemuneracion
                  ? ETIQUETAS_TIPO_REMUNERACION[empleado.tipoRemuneracion]
                  : "Sin configurar"}
              </span>,
              <span key="alta" className="whitespace-nowrap text-xs text-zinc-500">
                {formatearFecha(empleado.createdAt, locale)}
              </span>,
              <Etiqueta
                key="estado"
                tono={empleado.activo ? "exito" : "neutral"}
              >
                {empleado.activo ? "Activo" : "Inactivo"}
              </Etiqueta>,
              <div key="acciones" className="flex justify-end">
                <MenuAcciones
                  items={[
                    {
                      etiqueta: "Gestionar remuneración",
                      icono: <Wallet className="h-4 w-4" strokeWidth={1.75} />,
                      href: `/admin/empleados/${empleado.id}`,
                    },
                    {
                      etiqueta: `Cambiar a ${ETIQUETAS_ROL[rolAlternativo]}`,
                      icono:
                        empleado.rol === "ADMIN" ? (
                          <UserCog className="h-4 w-4" strokeWidth={1.75} />
                        ) : (
                          <ShieldCheck
                            className="h-4 w-4"
                            strokeWidth={1.75}
                          />
                        ),
                      accion: () =>
                        setCambioRol({
                          empleado,
                          nuevoRol: rolAlternativo,
                        }),
                    },
                    {
                      etiqueta: empleado.activo ? "Desactivar" : "Reactivar",
                      icono: <UserX className="h-4 w-4" strokeWidth={1.75} />,
                      peligro: empleado.activo,
                      accion: () => alternarEstado(empleado),
                      confirmacion: empleado.activo
                        ? {
                            titulo: "Desactivar empleado",
                            descripcion: `¿Desactivar a ${empleado.nombre ?? empleado.email}? No podrá iniciar sesión.`,
                            textoConfirmar: "Desactivar",
                          }
                        : undefined,
                    },
                  ]}
                />
              </div>,
            ],
          };
        })}
      />

      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo="Nuevo empleado"
      >
        <FormularioEmpleado
          alCerrar={() => setModalAbierto(false)}
          alExito={() => setModalAbierto(false)}
        />
      </Modal>

      <DialogoConfirmacion
        abierto={cambioRol !== null}
        alCerrar={() => setCambioRol(null)}
        alConfirmar={confirmarCambioRol}
        titulo="Confirmar cambio de rol"
        descripcion={
          cambioRol
            ? `Cambiar el rol de ${cambioRol.empleado.nombre ?? cambioRol.empleado.email} de ${ETIQUETAS_ROL[cambioRol.empleado.rol]} a ${ETIQUETAS_ROL[cambioRol.nuevoRol]}.`
            : ""
        }
        textoConfirmar="Confirmar cambio"
        cargando={pendiente}
        peligro={cambioRol?.nuevoRol === "EMPLEADO"}
      />
    </div>
  );
}
