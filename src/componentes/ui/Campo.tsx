import type { ReactNode } from "react";

export function Campo({
  etiqueta,
  htmlFor,
  requerido,
  error,
  ayuda,
  children,
}: {
  etiqueta: string;
  htmlFor?: string;
  requerido?: boolean;
  error?: string;
  ayuda?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-zinc-700"
      >
        {etiqueta}
        {requerido ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : ayuda ? (
        <p className="text-xs text-zinc-500">{ayuda}</p>
      ) : null}
    </div>
  );
}
