import bcrypt from "bcryptjs";

// Compara una contraseña en texto plano con su hash almacenado.
export async function verificarContrasena(
  contrasena: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(contrasena, hash);
}
