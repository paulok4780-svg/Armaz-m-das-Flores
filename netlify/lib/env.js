// Lê variáveis do ambiente. Localmente, carrega também o arquivo .env.admin
// (no Netlify elas vêm do painel: Site configuration > Environment variables).
import { readFileSync } from "node:fs";
let lido = false;
export function env(nome) {
  if (!lido) {
    lido = true;
    try {
      for (const l of readFileSync(".env.admin", "utf8").split(/\r?\n/)) {
        const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
        if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {}
  }
  return process.env[nome];
}
