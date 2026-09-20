export function PaginaEnConstruccion({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold text-zinc-900">{titulo}</h1>
      <p className="max-w-2xl text-sm text-zinc-600">{descripcion}</p>
      <p className="mt-6 inline-block rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Sección planificada. Se implementará en una fase posterior.
      </p>
    </section>
  );
}
