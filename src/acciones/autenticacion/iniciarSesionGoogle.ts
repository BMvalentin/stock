"use server";

import { signIn } from "@/auth";

export async function iniciarSesionGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/dashboard" });
}
