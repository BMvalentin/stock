import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = {
  etiqueta: ReactNode;
  error?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "className" | "type">;

export function CampoCheckbox({ etiqueta, error, id, ...resto }: Props) {
  const idCampo = id ?? resto.name;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={idCampo}
        className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
      >
        <input
          id={idCampo}
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/20"
          {...resto}
        />
        {etiqueta}
      </label>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
