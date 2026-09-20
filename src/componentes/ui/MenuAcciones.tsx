"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { DialogoConfirmacion } from "@/componentes/ui/DialogoConfirmacion";
import { cn } from "@/lib/utilidades/cn";

export type ItemAccion = {
  etiqueta: string;
  icono?: ReactNode;
  href?: string;
  peligro?: boolean;
  accion?: () => void | Promise<void>;
  confirmacion?: {
    titulo: string;
    descripcion: string;
    textoConfirmar?: string;
  };
};

// Menú de acciones contextuales. Se renderiza en un portal con posición fija
// para que no lo recorten los contenedores con scroll (tablas).
export function MenuAcciones({ items }: { items: ItemAccion[] }) {
  const botonRef = useRef<HTMLButtonElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [pendiente, setPendiente] = useState<ItemAccion | null>(null);
  const [enviando, iniciarTransicion] = useTransition();

  function alternar() {
    if (abierto) {
      setAbierto(false);
      return;
    }

    const rect = botonRef.current?.getBoundingClientRect();
    if (!rect) return;

    setCoords({ top: rect.bottom + 4, left: rect.right });
    setAbierto(true);
  }

  function ejecutar(item: ItemAccion) {
    if (!item.accion) return;

    iniciarTransicion(async () => {
      await item.accion?.();
      setPendiente(null);
      setAbierto(false);
    });
  }

  useEffect(() => {
    if (!abierto) return;

    function cerrar() {
      setAbierto(false);
    }

    window.addEventListener("scroll", cerrar, true);
    window.addEventListener("resize", cerrar);
    return () => {
      window.removeEventListener("scroll", cerrar, true);
      window.removeEventListener("resize", cerrar);
    };
  }, [abierto]);

  return (
    <div className="inline-block">
      <button
        ref={botonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label="Acciones"
        onClick={alternar}
        className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
      </button>

      {abierto && typeof document !== "undefined"
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Cerrar acciones"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setAbierto(false)}
              />
              <div
                role="menu"
                style={{ top: coords.top, left: coords.left }}
                className="fixed z-50 w-44 -translate-x-full rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
              >
                {items.map((item, indice) => {
                  const contenido = (
                    <>
                      {item.icono ? (
                        <span className="shrink-0">{item.icono}</span>
                      ) : null}
                      {item.etiqueta}
                    </>
                  );
                  const clases = cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                    item.peligro
                      ? "text-red-600 hover:bg-red-50"
                      : "text-zinc-700 hover:bg-zinc-100",
                  );

                  if (item.href) {
                    return (
                      <Link
                        key={indice}
                        href={item.href}
                        role="menuitem"
                        className={clases}
                        onClick={() => setAbierto(false)}
                      >
                        {contenido}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={indice}
                      type="button"
                      role="menuitem"
                      className={clases}
                      onClick={() => {
                        setAbierto(false);
                        if (item.confirmacion) setPendiente(item);
                        else ejecutar(item);
                      }}
                    >
                      {contenido}
                    </button>
                  );
                })}
              </div>
            </>,
            document.body,
          )
        : null}

      <DialogoConfirmacion
        abierto={pendiente !== null}
        alCerrar={() => setPendiente(null)}
        alConfirmar={() => pendiente && ejecutar(pendiente)}
        titulo={pendiente?.confirmacion?.titulo ?? ""}
        descripcion={pendiente?.confirmacion?.descripcion ?? ""}
        textoConfirmar={pendiente?.confirmacion?.textoConfirmar}
        cargando={enviando}
        peligro={pendiente?.peligro ?? true}
      />
    </div>
  );
}
