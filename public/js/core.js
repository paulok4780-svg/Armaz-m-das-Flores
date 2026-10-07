let dados, carrinho = {}, filtro = "todas";
const brl = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(t){ const el=document.getElementById("toast"); el.textContent=t; el.classList.add("ver"); setTimeout(()=>el.classList.remove("ver"),1800); }
async function carregar(){ const r = await fetch("/api/catalogo"); if(!r.ok) throw new Error("falha"); dados = await r.json(); }
function aplicarCores(L){
  const r = document.documentElement.style;
  r.setProperty("--verde", L.cor); r.setProperty("--rosa", L.cor2 || "#c2577a");
  if(CSS.supports("color","color-mix(in srgb, red 12%, white)")) r.setProperty("--verde-claro", `color-mix(in srgb, ${L.cor} 12%, #fff)`);
}
