# linktree-inelia

Linktree da Inelia Garcia (Autêntico Método Pilates), site estático, sem dependências.

- `src/data.mjs`: os botões, os textos e os endereços de checkout (um só lugar para editar).
- `node build.mjs`: gera `docs/` (é o que o GitHub Pages serve).
- Os caminhos são os mesmos do Linktree antigo da GreatPages (`/link-br`, `/link-esp`, `/link-eng`, `/link-bio-proutos-digitais`, `/link-bio-produtos-digitais-esp|eng`), para o link da bio e os QR codes não mudarem.
- Rastreio: GTM `GTM-5S4VC3BL` e um evento customizado `linktree_click` por botão (`dataLayer` e GA4). Nunca eventos padrão do Meta.
- Cada botão leva `utm_source=linktree&utm_medium=bio&utm_campaign=<idioma>&utm_content=<página>-<botão>`; checkouts da Hotmart levam também `src`.
- O `xcod` e o `_gl` que estavam congelados no HTML antigo não existem aqui.
- Domínio de teste: `links.ineliagarcia.com` (arquivo `docs/CNAME`). A troca do DNS de `www.ineliagarcia.com` é gesto do Felipe, depois de testar.
