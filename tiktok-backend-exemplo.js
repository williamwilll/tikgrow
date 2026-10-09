// Backend mínimo p/ trocar code TikTok por token e puxar seguidores reais
// Rode: npm i express && node tiktok-backend-exemplo.js
// Nunca exponha CLIENT_SECRET no index.html
const express = require('express');
const app = express();
app.use(express.json());

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || 'awfyanz7y2bffl7m';
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || 'TROQUE_PELA_ENV'; // NUNCA commite o segredo: use env var. Se exposto, gere outro no portal.
// Deve ser https e igual ao cadastrado em developers.tiktok.com (ex: https://seu-app.vercel.app/)
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://SEU-APP/index.html';

app.post('/api/tiktok/token', async (req, res) => {
  const { code } = req.body;
  const r = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: CLIENT_KEY, client_secret: CLIENT_SECRET,
      code, grant_type: 'authorization_code', redirect_uri: REDIRECT_URI
    })
  });
  res.json(await r.json());
});

app.get('/api/tiktok/me', async (req, res) => {
  const token = req.headers.authorization || '';
  const r = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count', {
    headers: { Authorization: token }
  });
  res.json(await r.json());
});

app.listen(3000, () => console.log('TikTok backend :3000'));
