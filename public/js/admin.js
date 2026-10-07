let abaAdm = "produtos", editando = null, token = sessionStorage.getItem("adm_token");
async function api(url, opts = {}){
  const r = await fetch(url, {...opts, headers:{"Content-Type":"application/json", ...(token?{Authorization:"Bearer "+token}:{})}});
  const d = await r.json().catch(()=>({}));
  if(r.status===401 && token){ sessionStorage.removeItem("adm_token"); token=null; renderAdmin(); }
  if(!r.ok) throw new Error(d.erro || "Erro inesperado");
  return d;
}
async function entrar(){
  try{ const d = await api("/api/admin/login",{method:"POST",body:JSON.stringify({senha:document.getElementById("senha").value})});
    token=d.token; sessionStorage.setItem("adm_token",token); renderAdmin(); }catch(e){ toast(e.message); }
}
function sair(){ sessionStorage.removeItem("adm_token"); token=null; renderAdmin(); }
let fila = Promise.resolve();
function salvar(msg){ fila = fila.then(async()=>{
  try{ const d = await api("/api/admin/catalogo",{method:"PUT",body:JSON.stringify(dados)});
    dados.produtos.forEach(p=>{ const x=d.produtos.find(q=>q.id===p.id); if(x && p.img.startsWith("data:")) p.img=x.img; });
    if((dados.loja.banner||"").startsWith("data:")) dados.loja.banner=d.loja.banner;
    if(msg) toast(msg); }catch(e){ toast(e.message); } }); return fila; }

function renderAdmin(){
  const C = document.getElementById("adminCorpo");
  if(!token){
    C.innerHTML = `<div class="painel login"><h2>Entrar</h2><label>Senha</label>
      <input type="password" id="senha" onkeydown="if(event.key==='Enter')entrar()"><div class="linha-btn"><button class="btn" style="flex:1" onclick="entrar()">Entrar</button></div>
      </div>`;
    return;
  }
  const abas = [["produtos","🌸 Plantas"],["categorias","🗂️ Categorias"],["loja","🏪 Dados da loja"],["visual","🎨 Aparência"],["backup","💾 Backup"]];
  C.innerHTML = `<div class="abas">${abas.map(([id,n])=>`<button class="aba ${abaAdm===id?"ativa":""}" onclick="abaAdm='${id}';editando=null;renderAdmin()">${n}</button>`).join("")}</div><div id="conteudoAba"></div>`;
  ({produtos:admProdutos,categorias:admCategorias,loja:admLoja,visual:admVisual,backup:admBackup})[abaAdm]();
}

/* Plantas */
function admProdutos(){
  const A = document.getElementById("conteudoAba");
  const p = editando;
  const opts = dados.categorias.map(c=>`<option value="${c.id}" ${p&&p.cat===c.id?"selected":""}>${esc(c.emoji)} ${esc(c.nome)}</option>`).join("");
  A.innerHTML = `
  <div class="painel">
    <h2>${p&&p.id?"Editar planta":"Nova planta"}</h2>
    <div class="grid2">
      <div><label>Nome</label><input id="pNome" value="${esc(p?.nome)}" placeholder="Ex: Orquídea Dendrobium"></div>
      <div><label>Preço (R$)</label><input id="pPreco" type="number" step="0.01" inputmode="decimal" value="${p?.preco??""}"></div>
      <div><label>Categoria</label><select id="pCat">${opts}</select></div>
      <div><label>Foto (do celular ou link)</label><input type="file" accept="image/*" id="pArq" onchange="lerFoto(this)"></div>
    </div>
    <input id="pImg" value="${esc(p?.img)}" placeholder="…ou cole o link da imagem" style="margin-top:8px" oninput="document.getElementById('pPrev').src=this.value">
    <img id="pPrev" class="prev-img" src="${esc(p?.img||"")}" alt="">
    <label>Descrição curta</label><textarea id="pDesc" rows="2" placeholder="Tamanho, luz, cuidados…">${esc(p?.desc)}</textarea>
    <div class="check"><input type="checkbox" id="pDisp" ${!p||p.disp?"checked":""}><span>Disponível para venda</span></div>
    <div class="linha-btn"><button class="btn" onclick="salvarProduto()">Salvar planta</button>${p?`<button class="btn linha" onclick="editando=null;renderAdmin()">Cancelar</button>`:""}</div>
  </div>
  <div class="painel lista-adm"><h2>Plantas no site (${dados.produtos.length})</h2>
    ${dados.produtos.map((x,i)=>`<div class="linha"><img src="${esc(x.img)}" alt=""><div class="nm"><strong>${esc(x.nome)}</strong><small>${brl(+x.preco)} · ${x.disp?"disponível":"esgotado"}</small></div>
      <div class="acoes"><button onclick="moverProd(${i},-1)">↑</button><button onclick="moverProd(${i},1)">↓</button>
      <button onclick="toggleDisp(${x.id})">${x.disp?"Esgotar":"Repor"}</button><button onclick="editarProd(${x.id})">Editar</button><button onclick="apagarProd(${x.id})">🗑</button></div></div>`).join("")}
  </div>`;
}
function lerFoto(inp){
  const f = inp.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = e => { const img = new Image(); img.onload = () => {
      const max=800, k=Math.min(1,max/Math.max(img.width,img.height));
      const c=document.createElement("canvas"); c.width=img.width*k; c.height=img.height*k;
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      const url=c.toDataURL("image/jpeg",.8);
      document.getElementById("pImg").value=url; document.getElementById("pPrev").src=url;
    }; img.src=e.target.result; };
  r.readAsDataURL(f);
}
function salvarProduto(){
  const nome=document.getElementById("pNome").value.trim(), preco=parseFloat(document.getElementById("pPreco").value);
  if(!nome||isNaN(preco)) return toast("Preencha nome e preço");
  const obj={nome,preco,cat:document.getElementById("pCat").value,img:document.getElementById("pImg").value.trim(),
    desc:document.getElementById("pDesc").value.trim(),disp:document.getElementById("pDisp").checked};
  if(editando&&editando.id) Object.assign(dados.produtos.find(x=>x.id===editando.id),obj);
  else dados.produtos.push({id:Date.now(),...obj});
  editando=null; salvar("Planta salva"); renderAdmin();
}
function editarProd(id){ editando={...dados.produtos.find(x=>x.id===id)}; renderAdmin(); window.scrollTo(0,0); }
function apagarProd(id){ if(confirm("Apagar esta planta do site?")){ dados.produtos=dados.produtos.filter(x=>x.id!==id); salvar("Planta removida"); renderAdmin(); } }
function toggleDisp(id){ const p=dados.produtos.find(x=>x.id===id); p.disp=!p.disp; salvar(p.disp?"Marcada como disponível":"Marcada como esgotada"); renderAdmin(); }
function moverProd(i,d){ const j=i+d; if(j<0||j>=dados.produtos.length) return; [dados.produtos[i],dados.produtos[j]]=[dados.produtos[j],dados.produtos[i]]; salvar(); renderAdmin(); }

/* Categorias */
function admCategorias(){
  document.getElementById("conteudoAba").innerHTML = `
  <div class="painel"><h2>Nova categoria</h2>
    <div class="grid2"><div><label>Nome</label><input id="cNome" placeholder="Ex: Suculentas"></div><div><label>Emoji</label><input id="cEmoji" placeholder="🌵" maxlength="4"></div></div>
    <div class="linha-btn"><button class="btn" onclick="addCat()">Adicionar</button></div></div>
  <div class="painel lista-adm"><h2>Categorias</h2>
    ${dados.categorias.map(c=>`<div class="linha"><div class="nm"><strong>${esc(c.emoji)} ${esc(c.nome)}</strong><small>${dados.produtos.filter(p=>p.cat===c.id).length} plantas</small></div>
      <div class="acoes"><button onclick="renCat('${c.id}')">Renomear</button><button onclick="apagarCat('${c.id}')">🗑</button></div></div>`).join("")}
  </div>`;
}
function addCat(){ const n=document.getElementById("cNome").value.trim(); if(!n) return toast("Digite um nome");
  dados.categorias.push({id:"c"+Date.now(),nome:n,emoji:document.getElementById("cEmoji").value.trim()||"🌱"}); salvar("Categoria criada"); renderAdmin(); }
function renCat(id){ const c=dados.categorias.find(x=>x.id===id); const n=prompt("Novo nome:",c.nome); if(n){ c.nome=n.trim(); salvar("Categoria renomeada"); renderAdmin(); } }
function apagarCat(id){ if(dados.produtos.some(p=>p.cat===id)) return toast("Mova ou apague as plantas dela antes");
  if(confirm("Apagar categoria?")){ dados.categorias=dados.categorias.filter(c=>c.id!==id); salvar("Categoria removida"); renderAdmin(); } }

/* Dados da loja */
function admLoja(){
  const L=dados.loja, campo=(k,r,t="text",ph="")=>`<div><label>${r}</label><input type="${t}" id="L_${k}" value="${esc(L[k])}" placeholder="${ph}"></div>`;
  document.getElementById("conteudoAba").innerHTML = `
  <div class="painel"><h2>Textos e contato</h2>
    <div class="grid2">
      ${campo("nome","Nome da loja")}${campo("titulo","Título principal")}
      ${campo("whatsapp","WhatsApp (só números, com 55 e DDD)","tel","5548999999999")}${campo("fixo","Telefone fixo")}
      ${campo("endereco","Endereço")}${campo("cnpj","CNPJ / MEI")}
      ${campo("horario","Horário de funcionamento")}${campo("instagram","Instagram","text","@sualoja")}
      ${campo("mapa","Endereço para o mapa")}
    </div>
    <label>Frase de apresentação</label><textarea id="L_slogan" rows="2">${esc(L.slogan)}</textarea>
    <label>Selos (separe com | )</label><input id="L_selos" value="${esc(L.selos)}">
    <div class="linha-btn"><button class="btn" onclick="salvarLoja()">Salvar alterações</button></div></div>
  <div class="painel"><h2>Senha do painel</h2><p style="color:var(--suave);font-size:.9rem">A senha fica na variável <code>ADMIN_PASSWORD</code> (arquivo <code>.env.admin</code> / painel do Netlify). Para trocar, altere lá e faça um novo deploy.</p></div>`;
}
function salvarLoja(){ Object.keys(dados.loja).forEach(k=>{ const el=document.getElementById("L_"+k); if(el) dados.loja[k]=el.value.trim(); });
  dados.loja.whatsapp=dados.loja.whatsapp.replace(/\D/g,""); salvar("Dados da loja salvos"); }

/* Backup */
function admBackup(){
  document.getElementById("conteudoAba").innerHTML = `
  <div class="painel"><h2>Backup</h2>
    <div class="aviso">As alterações ficam salvas só neste navegador. Baixe o backup para não perder nada ou para levar para outro aparelho.</div>
    <div class="linha-btn">
      <button class="btn" onclick="exportar()">⬇️ Baixar backup</button>
      <label class="btn linha" style="margin:0;color:var(--verde)">⬆️ Carregar backup<input type="file" accept=".json" hidden onchange="importar(this)"></label>
      <button class="btn perigo" onclick="restaurar()">Voltar ao original</button>
    </div></div>`;
}
function exportar(){ const b=new Blob([JSON.stringify(dados,null,2)],{type:"application/json"}); const a=document.createElement("a");
  a.href=URL.createObjectURL(b); a.download="armazem-das-flores-dados.json"; a.click(); }
function importar(inp){ const f=inp.files[0]; if(!f) return; const r=new FileReader();
  r.onload=e=>{ try{ const d=JSON.parse(e.target.result); if(!d.loja||!d.produtos) throw 0; dados=d; salvar("Backup carregado"); renderAdmin(); }catch(_){ toast("Arquivo inválido"); } }; r.readAsText(f); }
async function restaurar(){ if(confirm("Apagar todas as alterações e voltar ao catálogo original?")){ try{ dados=await api("/api/admin/catalogo",{method:"DELETE"}); toast("Catálogo restaurado"); renderAdmin(); }catch(e){ toast(e.message); } } }


carregar().then(()=>{ aplicarCores(dados.loja); renderAdmin(); }).catch(()=>toast("Erro ao carregar o catálogo"));

/* Aparência: cores e banner */
const CORES=[["#2f5d3a","Verde"],["#1f5d8a","Azul"],["#6b3fa0","Roxo"],["#c2577a","Rosa"],["#c2610f","Laranja"],["#8a2b3d","Vinho"],["#33414a","Grafite"]];
function previaCores(){ aplicarCores({cor:document.getElementById("V_cor").value, cor2:document.getElementById("V_cor2").value}); }
function escolherCor(c){ document.getElementById("V_cor").value=c; previaCores(); }
function admVisual(){
  const L=dados.loja;
  document.getElementById("conteudoAba").innerHTML=`
  <div class="painel"><h2>Cores do site</h2>
    <label>Cores prontas</label>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${CORES.map(([c,n])=>`<button title="${n}" aria-label="${n}" onclick="escolherCor('${c}')" style="width:36px;height:36px;border-radius:50%;background:${c};box-shadow:0 0 0 2px #fff,0 0 0 3px var(--borda)"></button>`).join("")}</div>
    <div class="grid2">
      <div><label>Cor principal (menu, botões, rodapé)</label><input type="color" id="V_cor" value="${esc(L.cor)}" oninput="previaCores()"></div>
      <div><label>Cor de destaque (contador do pedido)</label><input type="color" id="V_cor2" value="${esc(L.cor2||"#c2577a")}" oninput="previaCores()"></div>
    </div>
    <div class="linha-btn"><button class="btn" onclick="salvarCores()">Salvar cores</button><button class="btn linha" onclick="document.getElementById('V_cor2').value='#c2577a';escolherCor('#2f5d3a')">Cores originais</button></div>
  </div>
  <div class="painel"><h2>Banner do site</h2>
    <div class="aviso">Use uma imagem larga (ex.: 1600 × 500). Ela aparece no topo, logo abaixo do menu.</div>
    <input type="file" accept="image/*" onchange="lerBanner(this)">
    <input id="V_banner" value="${esc(L.banner)}" placeholder="…ou cole o link da imagem" style="margin-top:8px" oninput="document.getElementById('V_prev').src=this.value">
    <img id="V_prev" class="prev-img" src="${esc(L.banner||"")}" alt="" style="width:100%;height:auto;max-height:180px">
    <label>Link ao clicar no banner (opcional)</label><input id="V_link" value="${esc(L.bannerLink)}" placeholder="https://...">
    <div class="linha-btn"><button class="btn" onclick="salvarBanner()">Salvar banner</button><button class="btn perigo" onclick="removerBanner()">Remover banner</button></div>
  </div>`;
}
function salvarCores(){ dados.loja.cor=document.getElementById("V_cor").value; dados.loja.cor2=document.getElementById("V_cor2").value; salvar("Cores salvas"); }
function lerBanner(inp){
  const f=inp.files[0]; if(!f) return; const r=new FileReader();
  r.onload=e=>{ const i=new Image(); i.onload=()=>{ const k=Math.min(1,1600/Math.max(i.width,i.height));
    const c=document.createElement("canvas"); c.width=i.width*k; c.height=i.height*k; c.getContext("2d").drawImage(i,0,0,c.width,c.height);
    const u=c.toDataURL("image/jpeg",.82); document.getElementById("V_banner").value=u; document.getElementById("V_prev").src=u; }; i.src=e.target.result; };
  r.readAsDataURL(f);
}
function salvarBanner(){ dados.loja.banner=document.getElementById("V_banner").value.trim(); dados.loja.bannerLink=document.getElementById("V_link").value.trim(); salvar(dados.loja.banner?"Banner salvo":"Banner removido"); }
function removerBanner(){ dados.loja.banner=""; dados.loja.bannerLink=""; salvar("Banner removido"); renderAdmin(); }
