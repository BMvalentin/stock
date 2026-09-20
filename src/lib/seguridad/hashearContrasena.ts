import bcrypt from "bcryptjs";

// Genera un hash seguro. Nunca se almacena la contraseña en texto plano.
export async function hashearContrasena(contrasena: string): Promise<string> {
  return bcrypt.hash(contrasena, 12);
}
