export function Dato({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string | number | null;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-400">
        {etiqueta}
      </dt>
      <dd className="text-zinc-800">{valor ?? "—"}</dd>
    </div>
  );
}
