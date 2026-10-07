# Armazém das Flores — site para Netlify

- `public/` — site (`/`) e painel (`/admin/`)
- `netlify/functions/` — API (catálogo, login, imagens). Dados salvos no **Netlify Blobs**
- `.env.admin` — variáveis só do painel (senha e segredo da sessão)

## Testar localmente
```
npm install
npm run dev        # lê o .env.admin automaticamente
```
Site em http://localhost:8888 e painel em http://localhost:8888/admin/

## Publicar
1. Suba a pasta para um repositório Git e conecte no Netlify (publish dir `public`, sem build command), **ou** rode `npx netlify-cli deploy --prod`.
2. Envie as variáveis do painel: `npm run env:admin` (ou cadastre à mão em *Site configuration → Environment variables*).
3. Faça um novo deploy e entre em `/admin/`.

Arrastar a pasta no "Netlify Drop" não funciona: as Functions precisam de build.

## Imagens
Os produtos iniciais usam fotos de `catalogo-armazem-das-flores-tajuba.netlify.app/img/`. Se esse site antigo for apagado, reenvie as fotos pelo painel.
