import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";
import padrao from "./padrao.js";

const catalogo = () => getStore({ name: "catalogo", consistency: "strong" });
const imagens = () => getStore({ name: "imagens", consistency: "strong" });
const txt = (v, max = 300) => String(v ?? "").trim().slice(0, max);

export async function lerCatalogo() {
  const s = await catalogo().get("dados", { type: "json" });
  return s ? { ...padrao, ...s, loja: { ...padrao.loja, ...s.loja } } : padrao;
}

function limpar(d) {
  if (!d || !d.loja || !Array.isArray(d.produtos) || !Array.isArray(d.categorias)) throw new Error("Dados inválidos.");
  const loja = {};
  for (const k of Object.keys(padrao.loja)) loja[k] = txt(d.loja[k] ?? padrao.loja[k], 500);
  loja.whatsapp = loja.whatsapp.replace(/\D/g, "");
  if (!/^#[0-9a-f]{6}$/i.test(loja.cor)) loja.cor = padrao.loja.cor;
  const imgOk = (u) => (/^(https?:\/\/|\/api\/img\/|data:image\/)/.test(u) ? u : "");
  if (!/^#[0-9a-f]{6}$/i.test(loja.cor2)) loja.cor2 = padrao.loja.cor2;
  loja.banner = imgOk(txt(d.loja.banner, 3_000_000));
  loja.bannerLink = /^https?:\/\//.test(loja.bannerLink) ? loja.bannerLink : "";
  return {
    loja,
    categorias: d.categorias.slice(0, 50).map((c) => ({ id: txt(c.id, 40), nome: txt(c.nome, 60), emoji: txt(c.emoji, 8) })),
    produtos: d.produtos.slice(0, 500).map((p) => ({
      id: Number(p.id) || Date.now(),
      nome: txt(p.nome, 120),
      preco: Math.max(0, Number(p.preco) || 0),
      cat: txt(p.cat, 40),
      img: imgOk(txt(p.img, 3_000_000)),
      desc: txt(p.desc, 400),
      disp: !!p.disp,
    })),
  };
}

// Fotos enviadas do celular (data URL) viram arquivos no Blobs, servidos em /api/img/<chave>
async function guardarImagens(produtos) {
  for (const p of produtos) {
    const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(p.img);
    if (!m) continue;
    const buf = Buffer.from(m[2], "base64");
    if (buf.length > 2_000_000) throw new Error("Foto muito grande (máx. 2 MB).");
    const chave = createHash("sha256").update(buf).digest("hex").slice(0, 24);
    await imagens().set(chave, buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), { metadata: { tipo: m[1] } });
    p.img = `/api/img/${chave}`;
  }
}

export async function salvarCatalogo(entrada) {
  const d = limpar(entrada);
  const b = { img: d.loja.banner };
  await guardarImagens([...d.produtos, b]);
  d.loja.banner = b.img;
  await catalogo().setJSON("dados", d);
  return d;
}

export async function restaurarCatalogo() {
  await catalogo().delete("dados");
  return padrao;
}

export const lerImagem = (chave) => imagens().getWithMetadata(chave, { type: "arrayBuffer" });
