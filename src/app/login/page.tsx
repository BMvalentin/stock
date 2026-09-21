import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FormularioLogin } from "@/componentes/autenticacion/FormularioLogin";
import { googleHabilitado } from "@/lib/configuracion/googleHabilitado";

export const metadata = { title: "Iniciar sesión" };

export default async function PaginaLogin() {
  const sesion = await auth();

  if (sesion?.user) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <header className="mb-6 space-y-1 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">
            Gestión de Stock
          </h1>
          <p className="text-sm text-zinc-500">
            Accedé con tu correo o con Google
          </p>
        </header>

        <div className="flex justify-center">
          <FormularioLogin googleHabilitado={googleHabilitado} />
        </div>
      </div>
    </main>
  );
}
