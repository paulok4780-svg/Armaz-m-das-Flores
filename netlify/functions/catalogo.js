import { lerCatalogo } from "../lib/catalogo.js";
import { json } from "../lib/auth.js";

export default async () => json(await lerCatalogo(), 200, { "Cache-Control": "no-cache" });
export const config = { path: "/api/catalogo" };
