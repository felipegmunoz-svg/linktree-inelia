// Gera o site estático em docs/ a partir de src/data.mjs. Sem dependências: `node build.mjs`.
import fs from "node:fs";
import path from "node:path";
import { SITE, IDIOMAS } from "./src/data.mjs";

const OUT = "docs";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// UTM de cada botão: origem fixa «linktree», meio «bio», campanha = idioma, conteúdo = página + botão.
function comUtm(href, lang, pagina, id) {
  const u = new URL(href);
  if (u.hostname === "wa.me") return href; // a mensagem pronta é o destino; não se mexe
  const set = { utm_source: "linktree", utm_medium: "bio", utm_campaign: lang, utm_content: `${pagina}-${id}` };
  for (const [k, v] of Object.entries(set)) u.searchParams.set(k, v);
  if (u.hostname === "pay.hotmart.com") u.searchParams.set("src", `linktree-${lang}-${id}`);
  return u.toString();
}

const BADGE = `<svg class="badge" viewBox="0 0 208 208" aria-hidden="true"><path fill="#36a5dd" d="m30.5,177.5c-9.2-9.2-3.1-28.5-7.8-39.8S0,116.5,0,104s17.8-22,22.7-33.7-1.4-30.6,7.8-39.8,28.5-3.1,39.8-7.8S91.5,0,104,0s22,17.8,33.7,22.7,30.6-1.4,39.8,7.8,3.1,28.5,7.8,39.8,22.7,21.2,22.7,33.7-17.8,22-22.7,33.7,1.4,30.6-7.8,39.8-28.5,3.1-39.8,7.8-21.2,22.7-33.7,22.7-22-17.8-33.7-22.7-30.6,1.4-39.8-7.8Z"/><polyline fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="19" points="140.55 84.74 91.79 131.26 67.45 108"/></svg>`;
const SETA = `<svg class="seta" viewBox="0 0 256 256" aria-hidden="true"><g fill="none" stroke="#FF998B" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><line x1="40" y1="128" x2="216" y2="128"/><polyline points="144,56 216,128 144,200"/></g></svg>`;

const CSS = `
:root{--tinta:#222;--pill:#2f2f2f;--laranja:#e2711d;--suave:#8a8f94}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:"Montserrat",system-ui,sans-serif;color:var(--tinta);background:#fff}
a{color:inherit;text-decoration:none}
.avatar{position:relative;width:96px;height:96px;margin:0 auto}
.avatar img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
.badge{position:absolute;right:-4px;top:-4px;width:26px;height:26px}
.nome{font-weight:700;margin:14px 0 0;text-align:center}
.sub{margin:8px 0 0;text-align:center;font-size:11px}
.rodape{background:#242424;color:#fff;text-align:center;padding:36px 24px 40px;font-size:13px;line-height:1.55}
.rodape img{width:64px;height:64px;filter:brightness(0) invert(1);margin-bottom:14px}
.rodape p{max-width:420px;margin:0 auto}
.cookies{position:fixed;left:12px;right:12px;bottom:12px;max-width:460px;margin:0 auto;background:#fff;color:#222;border-radius:10px;box-shadow:0 6px 28px rgba(0,0,0,.25);padding:18px;text-align:center;font:14px/1.4 system-ui,sans-serif;z-index:9}
.cookies button{margin-top:12px;background:#0b7bea;color:#fff;border:0;border-radius:6px;padding:10px 22px;font:600 14px system-ui,sans-serif;cursor:pointer}
.cookies[hidden]{display:none}
/* páginas de links */
.fundo{min-height:100vh;background:#e9dcc7 url(/img/bg.jpg) center/cover fixed;position:relative}
.fundo::before{content:"";position:absolute;inset:0;background:rgba(40,36,32,.38)}
.fundo>*{position:relative}
.topo{padding:52px 20px 40px;max-width:520px;margin:0 auto}
.fundo .nome{color:#fff;font-size:17px}.fundo .sub{color:#fff;opacity:.9}
.lista{display:flex;flex-direction:column;gap:16px;margin-top:34px}
.pill{display:flex;align-items:center;justify-content:center;min-height:62px;padding:12px 26px;border-radius:999px;background:var(--pill);color:#fff;font-weight:600;font-size:14px;text-align:center;position:relative;transition:transform .15s}
.pill:hover{transform:translateY(-2px)}
.pill.vidro{background:rgba(255,255,255,.22);border:2px solid rgba(255,255,255,.55);font-weight:500}
.pill .seta{position:absolute;right:20px;width:22px;height:22px}
/* produtos digitais */
.prod{padding:44px 20px 20px;max-width:520px;margin:0 auto;text-align:center}
.prod .nome{font-size:24px}.prod .sub{color:var(--suave);font-size:14px}
.card{margin-top:56px;padding-top:36px;border-top:1px solid #e6e6e6}
.card:first-of-type{border-top:0;margin-top:48px;padding-top:0}
.kicker{margin:0;color:var(--suave);font-weight:700;font-size:15px}
.card h2{margin:10px 0 18px;font-size:24px;line-height:1.25;font-weight:800}
.card img.foto{width:100%;border-radius:10px;display:block;aspect-ratio:4/3;object-fit:cover}
.card p.txt{margin:18px auto 0;line-height:1.5;font-size:15px;color:#555;font-weight:300}
.btn{display:inline-block;margin:26px auto 0;min-width:230px;padding:16px 28px;background:var(--laranja);color:#fff;font-weight:700;border-radius:4px}
.btn.sec{background:transparent;color:var(--laranja);border:2px solid var(--laranja);margin-left:0}
.acoes{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:26px}.acoes .btn{margin:0}
.fim{height:48px}
`;

const COOKIE = (t) => `<div class="cookies" id="ck" hidden><div>${esc(t.cookies)}</div><button type="button" id="ckok">${esc(t.ok)}</button></div>`;

// Rastreio: GTM (o contêiner que as páginas antigas já carregavam) + um evento CUSTOMIZADO por clique.
// Nunca `InitiateCheckout` nem outro evento padrão do Meta: a blindagem do pixel proíbe (medicao-e-campanhas §8).
function head(titulo, lang, pagina, icone = "img/favicon.png") {
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titulo)}</title>
<link rel="icon" href="/${icone}"><link rel="apple-touch-icon" href="/${icone}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style>
<script>window.dataLayer=window.dataLayer||[];window.__pagina=${JSON.stringify(pagina)};window.__lang=${JSON.stringify(lang)};</script>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${SITE.gtm}');</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.ga4}"></script>
<script>function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${SITE.ga4}',{send_page_view:false});</script>
</head><body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${SITE.gtm}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
}

const JS = `<script>
(function(){
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[data-lt]');if(!a)return;
    var p={link_id:a.getAttribute('data-lt'),link_text:(a.textContent||'').trim().slice(0,80),link_url:a.href,pagina:window.__pagina,idioma:window.__lang};
    window.dataLayer.push(Object.assign({event:'linktree_click'},p));
    if(window.gtag)gtag('event','linktree_click',p);
  });
  try{var ck=document.getElementById('ck');if(ck&&!localStorage.getItem('lt_ck')){ck.hidden=false;document.getElementById('ckok').onclick=function(){localStorage.setItem('lt_ck','1');ck.hidden=true}}}catch(_){var c=document.getElementById('ck');if(c)c.hidden=false}
})();
</script>`;

function rodape() {
  return `<footer class="rodape"><img src="/img/logo.png" alt="Authentic Pilates Inelia Garcia"><p>${esc(SITE.rodape)}</p></footer>`;
}

function topo(avatar) {
  return `<div class="avatar"><img src="/img/${avatar}" alt="Inelia Garcia">${BADGE}</div><h1 class="nome">${esc(SITE.nome)}</h1>`;
}

function paginaRaiz() {
  const itens = [["br", "Português"], ["es", "Español"], ["en", "English"]]
    .map(([k, txt]) => `<a class="pill vidro" data-lt="idioma-${k}" href="/${IDIOMAS[k].path}">${txt}${SETA}</a>`)
    .join("");
  return head("Inelia Garcia", "pt-BR", "raiz") + `<div class="fundo"><div class="topo">${topo("avatar-link.jpg")}<p class="sub">Teacher of the Teachers</p><div class="lista">${itens}</div></div></div>${rodape()}${COOKIE(IDIOMAS.br)}${JS}</body></html>`;
}

function paginaLinks(k) {
  const t = IDIOMAS[k];
  const itens = t.botoes
    .map((b) => {
      const alvo = b.href === "@prod" ? `/${t.prod}` : comUtm(b.href, k, "links", b.id);
      const ext = alvo.startsWith("http") ? ` rel="noopener"` : "";
      return `<a class="pill" data-lt="${b.id}" href="${esc(alvo)}"${ext}>${esc(b.texto)}</a>`;
    })
    .join("");
  return head(t.titulo, t.lang, `links-${k}`) + `<div class="fundo"><div class="topo">${topo("avatar-link.jpg")}<p class="sub">${esc(t.tagline)}</p><div class="lista">${itens}</div></div></div>${rodape()}${COOKIE(t)}${JS}</body></html>`;
}

function paginaProdutos(k) {
  const t = IDIOMAS[k];
  const p = t.produtos;
  const cards = p.cards
    .map((c) => {
      const txt = c.txt.map((x) => `<p class="txt">${esc(x)}</p>`).join("");
      const comprar = `<a class="btn" data-lt="comprar-${c.id}" rel="noopener" href="${esc(comUtm(c.href, k, "produtos", c.id))}">${esc(p.adquirir)}</a>`;
      const saber = c.destaque ? `<a class="btn sec" data-lt="saber-mais" rel="noopener" href="${esc(comUtm(p.landing, k, "produtos", "saber-mais"))}">${esc(p.saber)}</a>` : "";
      return `<section class="card"><p class="kicker">${esc(c.kicker)}</p><h2>${esc(c.titulo)}</h2><img class="foto" loading="lazy" src="/img/${c.img}" alt="${esc(c.titulo)}">${txt}<div class="acoes">${comprar}${saber}</div></section>`;
    })
    .join("");
  return head("Produtos Digitais", t.lang, `produtos-${k}`) + `<main class="prod"><div class="avatar"><img src="/img/avatar-prod.jpg" alt="Inelia Garcia">${BADGE}</div><h1 class="nome">${esc(SITE.nome)}</h1><p class="sub">${SITE.handle}</p>${cards}</main><div class="fim"></div>${rodape()}${COOKIE(t)}${JS}</body></html>`;
}

function pagina404() {
  return head("Inelia Garcia", "pt-BR", "404") + `<div class="fundo"><div class="topo">${topo("avatar-link.jpg")}<div class="lista"><a class="pill" data-lt="404-home" href="/">ineliagarcia.com</a></div></div></div>${rodape()}${JS}</body></html>`;
}

const write = (rel, txt) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, txt); };

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync("src/img", path.join(OUT, "img"), { recursive: true });
write("index.html", paginaRaiz());
write("404.html", pagina404());
for (const k of Object.keys(IDIOMAS)) {
  write(`${IDIOMAS[k].path}/index.html`, paginaLinks(k));
  write(`${IDIOMAS[k].prod}/index.html`, paginaProdutos(k));
}
// Páginas de upsell do Pré-Pilates (export estático das da GreatPages, assets e CSS/JS próprios, sem o GTM antigo)
if (fs.existsSync("src/upsell")) for (const d of fs.readdirSync("src/upsell")) fs.cpSync(path.join("src/upsell", d), path.join(OUT, d), { recursive: true });
write("CNAME", "links.ineliagarcia.com");
write(".nojekyll", "");
console.log("gerado em", OUT);
