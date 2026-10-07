import { configurado, tokenValido, json } from "../lib/auth.js";
import { salvarCatalogo, restaurarCatalogo } from "../lib/catalogo.js";

export default async (req) => {
  if (!configurado()) return json({ erro: "Painel não configurado." }, 503);
  if (!tokenValido(req)) return json({ erro: "Sessão expirada. Entre novamente." }, 401);
  try {
    if (req.method === "PUT") return json(await salvarCatalogo(await req.json()));
    if (req.method === "DELETE") return json(await restaurarCatalogo());
    return json({ erro: "Método não permitido." }, 405);
  } catch (e) {
    return json({ erro: e.message || "Não foi possível salvar." }, 400);
  }
};
export const config = { path: "/api/admin/catalogo" };
