import { configurado, senhaCorreta, criarToken, json } from "../lib/auth.js";

export default async (req) => {
  if (req.method !== "POST") return json({ erro: "Método não permitido." }, 405);
  if (!configurado()) return json({ erro: "Painel não configurado: defina ADMIN_PASSWORD e ADMIN_SESSION_SECRET (mín. 16 caracteres)." }, 503);
  const { senha = "" } = await req.json().catch(() => ({}));
  if (!senhaCorreta(senha)) {
    await new Promise((r) => setTimeout(r, 800)); // freia tentativas em sequência
    return json({ erro: "Senha incorreta." }, 401);
  }
  return json(criarToken());
};
export const config = { path: "/api/admin/login" };
