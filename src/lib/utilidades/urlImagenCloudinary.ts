// Genera una URL de entrega optimizada a partir de la URL segura guardada en
// el producto. Es una transformación puramente textual (sin credenciales), por
// lo que puede usarse tanto en servidor como en cliente. Para miniaturas y
// listados conviene un tamaño chico; para el detalle, uno mayor.
export function urlImagenCloudinary(
  url: string,
  ancho: number,
  alto?: number,
): string {
  const marcador = "/upload/";
  const indice = url.indexOf(marcador);

  if (indice === -1) return url;

  const altoParametro = alto ? `,h_${alto}` : "";
  const transformaciones = `f_auto,q_auto,c_fill,w_${ancho}${altoParametro}`;

  return `${url.slice(0, indice + marcador.length)}${transformaciones}/${url.slice(
    indice + marcador.length,
  )}`;
}
