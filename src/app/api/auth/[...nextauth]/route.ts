import { handlers } from "@/auth";

// Route Handler de Auth.js. Es la única API Route necesaria: el resto de las
// operaciones internas se resuelven con Server Actions.
export const { GET, POST } = handlers;
