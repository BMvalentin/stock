import { Esqueleto } from "@/componentes/ui/Esqueleto";

// Estado de carga del listado de productos. Permite que la cabecera y el shell
// se pinten de inmediato mientras corren las consultas de la página en paralelo.
export default function CargandoProductos() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Esqueleto className="h-7 w-40" />
        <Esqueleto className="h-4 w-64" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Esqueleto className="h-9 w-72" />
        <Esqueleto className="h-9 w-40" />
        <Esqueleto className="h-9 w-40" />
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="space-y-3 p-4">
          {Array.from({ length: 8 }).map((_, indice) => (
            <div key={indice} className="flex items-center gap-3">
              <Esqueleto className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Esqueleto className="h-4 w-1/3" />
                <Esqueleto className="h-3 w-1/5" />
              </div>
              <Esqueleto className="h-4 w-24" />
              <Esqueleto className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
