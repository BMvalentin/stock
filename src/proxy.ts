import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { nivelRequeridoParaRuta } from "@/lib/seguridad/nivelRequeridoParaRuta";

// Gate optimista de navegación para el panel. Comprueba la presencia de la
// cookie de sesión de Auth.js y, si falta, redirige al login antes de renderizar
// cualquier ruta que exija autenticación. NO es la frontera de seguridad: el rol
// y la vigencia de la sesión se validan en el servidor (layout de (soloAdmin),
// `requerirAdmin` y cada Server Action). Se ejecuta en runtime Node.js
// (default en Next 16).
const COOKIES_SESION = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export function proxy(request: NextRequest) {
  const nivel = nivelRequeridoParaRuta(request.nextUrl.pathname);

  if (nivel === "PUBLICO") {
    return NextResponse.next();
  }

  const tieneSesion = COOKIES_SESION.some((nombre) =>
    request.cookies.has(nombre),
  );

  if (tieneSesion) {
    return NextResponse.next();
  }

  const url = new URL("/login", request.url);
  url.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/empleado/:path*"],
};
