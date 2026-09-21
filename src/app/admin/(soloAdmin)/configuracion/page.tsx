import Link from "next/link";
import { requerirAdmin } from "@/lib/seguridad/requerirAdmin";
import { obtenerConfiguracionGeneral } from "@/servicios/configuracion/obtenerConfiguracionGeneral";
import { obtenerConfiguracionEnvio } from "@/servicios/configuracion/obtenerConfiguracionEnvio";
import { listarMetodosPago } from "@/servicios/configuracion/listarMetodosPago";
import { EncabezadoPagina } from "@/componentes/ui/EncabezadoPagina";
import { SeccionFormulario } from "@/componentes/ui/SeccionFormulario";
import { FormularioGeneral } from "@/componentes/configuracion/FormularioGeneral";
import { FormularioEnvio } from "@/componentes/configuracion/FormularioEnvio";
import { TablaMetodosPago } from "@/componentes/configuracion/TablaMetodosPago";

export const metadata = { title: "Configuración" };

export default async function PaginaConfiguracion() {
  await requerirAdmin();

  const [general, envio, metodos] = await Promise.all([
    obtenerConfiguracionGeneral(),
    obtenerConfiguracionEnvio(),
    listarMetodosPago(),
  ]);

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Configuración"
        descripcion="Datos del comercio, métodos de pago y reglas de envío. Todo se guarda en la base de datos."
      />

      <SeccionFormulario
        titulo="General y negocio"
        descripcion="Nombre del comercio, moneda y formato regional."
      >
        <FormularioGeneral
          configuracion={{
            nombreComercio: general.nombreComercio,
            moneda: general.moneda,
            locale: general.locale,
          }}
        />
      </SeccionFormulario>

      <SeccionFormulario
        titulo="Métodos de pago"
        descripcion="Cada producto define un precio por método de pago activo."
      >
        <TablaMetodosPago metodos={metodos} />
      </SeccionFormulario>

      <SeccionFormulario
        titulo="Envíos"
        descripcion="Estrategia de cálculo del costo de envío."
      >
        <FormularioEnvio
          configuracion={{ tipo: envio.tipo, precio: envio.precio }}
        />
      </SeccionFormulario>

      <SeccionFormulario
        titulo="Usuarios"
        descripcion="La gestión de usuarios y roles se realiza en la sección Empleados."
      >
        <Link
          href="/admin/empleados"
          className="text-sm font-medium text-zinc-700 underline-offset-2 hover:underline"
        >
          Ir a Empleados
        </Link>
      </SeccionFormulario>
    </div>
  );
}
