"use client";

import { useActionState } from "react";
import { iniciarSesion } from "@/acciones/autenticacion/iniciarSesion";
import { iniciarSesionGoogle } from "@/acciones/autenticacion/iniciarSesionGoogle";
import type { EstadoLogin } from "@/tipos/autenticacion";

const ESTADO_INICIAL: EstadoLogin = {};

export function FormularioLogin({
  googleHabilitado,
}: {
  googleHabilitado: boolean;
}) {
  const [estado, accion, pendiente] = useActionState(
    iniciarSesion,
    ESTADO_INICIAL,
  );

  return (
    <div className="w-full max-w-sm space-y-6">
      <form action={accion} className="space-y-4">
        {estado.error ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {estado.error}
          </p>
        ) : null}

        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-700"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="contrasena"
            className="block text-sm font-medium text-zinc-700"
          >
            Contraseña
          </label>
          <input
            id="contrasena"
            name="contrasena"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
          />
        </div>

        <button
          type="submit"
          disabled={pendiente}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
        >
          {pendiente ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      {googleHabilitado ? (
        <>
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="h-px flex-1 bg-zinc-200" />
            o
            <span className="h-px flex-1 bg-zinc-200" />
          </div>

          <form action={iniciarSesionGoogle}>
            <button
              type="submit"
              className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Continuar con Google
            </button>
          </form>
        </>
      ) : null}
    </div>
  );
}
