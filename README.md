# TikGrow

Dashboard de crescimento orgânico TikTok: roteiros, hooks IA, agenda 30d, análise de vídeos, perfil e vendas.

## Publicar no Render (sem instalar nada)

1. Crie o repositório: github.com/new → nome `tikgrow` → Public → Create.
2. Dentro dele: Add file → Upload files → arraste TODO o conteúdo desta pasta
   (`index.html`, `render.yaml`, `README.md`) → Commit.
3. No Render: dashboard → New + → Static Site → conecte o repo `tikgrow` →
   Publish Directory `./` → Create. O `render.yaml` já deixa autoDeploy ligado:
   cada upload novo no GitHub republica sozinho.

A URL final (ex: `https://tikgrow.onrender.com`) é a que entra como
Redirect URI no portal TikTok Developers e no vídeo demo.

## Arquivos

- `index.html` — app completo (login local + geradores + dashboard)
- `plano-30dias-motivacao.html` — plano 30 dias motivação 0-1k
- `roteiros-7-dias.html` — roteiros moda antigos
- `tiktok-backend-exemplo.js` — backend opcional p/ Login TikTok oficial (pausado)
