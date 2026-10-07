/* ---------- Site público ---------- */
function renderSite(){
  const L = dados.loja;
  aplicarCores(L);
  const B = document.getElementById("banner");
  if(L.banner){ const im = `<img src="${esc(L.banner)}" alt="${esc(L.nome)}">`;
    B.innerHTML = L.bannerLink ? `<a href="${esc(L.bannerLink)}" target="_blank" rel="noopener">${im}</a>` : im; B.hidden = false; }
  else { B.innerHTML = ""; B.hidden = true; }
  document.getElementById("tLogo").textContent = L.nome;
  document.getElementById("tTitulo").textContent = L.titulo;
  document.getElementById("tSlogan").textContent = L.slogan;
  document.getElementById("selos").innerHTML = L.selos.split("|").filter(Boolean).map(s=>`<span class="selo">${esc(s)}</span>`).join("");
  document.getElementById("fNome").textContent = L.nome;
  document.getElementById("fDoc").textContent = L.cnpj;
  document.getElementById("fEnd").textContent = L.endereco;
  document.getElementById("fContato").innerHTML = `📞 ${esc(L.fixo)}<br>💬 <a href="https://wa.me/${esc(L.whatsapp)}" target="_blank">WhatsApp</a>` + (L.instagram?`<br>📷 <a href="https://instagram.com/${esc(L.instagram.replace("@",""))}" target="_blank">${esc(L.instagram)}</a>`:"");
  document.getElementById("fHorario").textContent = "🕒 " + L.horario;
  document.getElementById("fMapa").innerHTML = L.mapa ? `<iframe loading="lazy" title="Mapa" src="https://maps.google.com/maps?q=${encodeURIComponent(L.mapa)}&output=embed"></iframe>` : "";
  document.getElementById("zapBtn").href = `https://wa.me/${L.whatsapp}?text=${encodeURIComponent("Olá! Vim pelo catálogo e tenho uma dúvida.")}`;

  const chips = [{id:"todas",nome:"Todas",emoji:"✨"},...dados.categorias];
  document.getElementById("chips").innerHTML = chips.map(c=>`<button class="chip ${filtro===c.id?"ativo":""}" onclick="filtrar('${c.id}')">${esc(c.emoji)} ${esc(c.nome)}</button>`).join("");

  const lista = dados.produtos.filter(p=>filtro==="todas"||p.cat===filtro);
  const nomeCat = id => (dados.categorias.find(c=>c.id===id)||{}).nome || "";
  document.getElementById("grade").innerHTML = lista.length ? lista.map(p=>`
    <article class="card">
      <div class="${p.disp?"":"esgotado"}"><img class="foto" loading="lazy" src="${esc(p.img)}" alt="${esc(p.nome)}" onclick="ampliar(this.src)"></div>
      <div class="info">
        <span class="tag">${esc(nomeCat(p.cat))}</span>
        <h3>${esc(p.nome)}</h3>
        <p class="desc">${esc(p.desc)}</p>
        <div class="preco">${brl(+p.preco)}</div>
        <button class="btn" ${p.disp?"":"disabled"} onclick="addCarrinho(${p.id})">${p.disp?"Adicionar ao pedido":"Indisponível"}</button>
      </div>
    </article>`).join("") : `<p class="vazio">Nenhuma planta nesta categoria ainda.</p>`;
  renderCarrinho();
}
function filtrar(id){ filtro=id; renderSite(); }
function ampliar(src){ document.getElementById("lbImg").src=src; document.getElementById("lightbox").classList.add("aberto"); }

/* ---------- Carrinho ---------- */
function addCarrinho(id){ carrinho[id]=(carrinho[id]||0)+1; renderCarrinho(); toast("Adicionado ao pedido"); }
function mudarQtd(id,d){ carrinho[id]=(carrinho[id]||0)+d; if(carrinho[id]<=0) delete carrinho[id]; renderCarrinho(); }
function itensCarrinho(){ return Object.entries(carrinho).map(([id,q])=>({p:dados.produtos.find(x=>x.id==id),q})).filter(i=>i.p); }
function renderCarrinho(){
  const its = itensCarrinho();
  document.getElementById("badge").textContent = its.reduce((s,i)=>s+i.q,0);
  document.getElementById("itens").innerHTML = its.length ? its.map(({p,q})=>`
    <div class="item"><img src="${esc(p.img)}" alt=""><div class="nm">${esc(p.nome)}<br><small>${brl(+p.preco)}</small></div>
    <div class="qtd"><button onclick="mudarQtd(${p.id},-1)">−</button>${q}<button onclick="mudarQtd(${p.id},1)">+</button></div></div>`).join("")
    : `<p class="vazio">Seu pedido está vazio.</p>`;
  document.getElementById("total").textContent = brl(its.reduce((s,i)=>s+i.p.preco*i.q,0));
  document.getElementById("btnEnviar").disabled = !its.length;
}
function abrirCarrinho(){ document.getElementById("gaveta").classList.add("aberta"); document.getElementById("fundo").classList.add("aberto"); }
function fecharCarrinho(){ document.getElementById("gaveta").classList.remove("aberta"); document.getElementById("fundo").classList.remove("aberto"); }
function enviarPedido(){
  const its = itensCarrinho(); if(!its.length) return;
  const total = its.reduce((s,i)=>s+i.p.preco*i.q,0);
  const txt = "Olá! Gostaria de fazer este pedido:\n\n" + its.map(({p,q})=>`• ${q}x ${p.nome} – ${brl(p.preco*q)}`).join("\n")
    + `\n\nTotal: ${brl(total)}\nRecebimento: ${document.getElementById("entrega").value}`;
  window.open(`https://wa.me/${dados.loja.whatsapp}?text=${encodeURIComponent(txt)}`,"_blank");
}

carregar().then(renderSite).catch(()=>{ document.getElementById("grade").innerHTML='<p class="vazio">Não foi possível carregar o catálogo. Atualize a página.</p>'; });
