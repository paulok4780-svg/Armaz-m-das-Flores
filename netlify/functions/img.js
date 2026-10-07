import { lerImagem } from "../lib/catalogo.js";

export default async (req, context) => {
  const chave = context.params.chave;
  if (!/^[a-f0-9]{24}$/.test(chave)) return new Response("Não encontrada", { status: 404 });
  const r = await lerImagem(chave);
  if (!r) return new Response("Não encontrada", { status: 404 });
  return new Response(r.data, {
    headers: { "Content-Type": r.metadata?.tipo || "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" },
  });
};
export const config = { path: "/api/img/:chave" };
