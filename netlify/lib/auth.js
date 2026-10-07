import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env.js";

const assinar = (p) => createHmac("sha256", env("ADMIN_SESSION_SECRET")).update(p).digest("base64url");
const igual = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
};

export const configurado = () => !!env("ADMIN_PASSWORD") && (env("ADMIN_SESSION_SECRET") || "").length >= 16;
export const senhaCorreta = (s) => igual(s, env("ADMIN_PASSWORD"));

export function criarToken() {
  const horas = Number(env("ADMIN_SESSION_HOURS")) || 8;
  const exp = Date.now() + horas * 3600e3;
  const p = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  return { token: `${p}.${assinar(p)}`, exp };
}

export function tokenValido(req) {
  const [p, s] = (req.headers.get("authorization") || "").replace(/^Bearer /, "").split(".");
  if (!p || !s || !igual(s, assinar(p))) return false;
  try { return JSON.parse(Buffer.from(p, "base64url")).exp > Date.now(); } catch { return false; }
}

export const json = (dados, status = 200, headers = {}) =>
  new Response(JSON.stringify(dados), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers },
  });
