// Indica si Google OAuth está configurado. Sin credenciales, el proveedor
// no se registra y el botón no se muestra en la pantalla de login.
export const googleHabilitado = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);
