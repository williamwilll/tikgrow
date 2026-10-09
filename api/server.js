const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'https://tikgrow.onrender.com' }));

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || '';
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://tikgrow.onrender.com/';

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/tiktok/token', async (req, res) => {
  try {
    const code = (req.body || {}).code;
    if (!code) return res.status(400).json({ error: 'code requerido' });
    const r = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: CLIENT_KEY, client_secret: CLIENT_SECRET,
        code, grant_type: 'authorization_code', redirect_uri: REDIRECT_URI
      })
    });
    const j = await r.json();
    if (!r.ok || !j.access_token) return res.status(400).json(j);
    res.json({ access_token: j.access_token, open_id: j.open_id, expires_in: j.expires_in });
  } catch (e) { res.status(500).json({ error: 'falha token' }); }
});

app.get('/api/tiktok/me', async (req, res) => {
  try {
    let t = req.headers.authorization || '';
    if (!t) return res.status(401).json({ error: 'sem token' });
    if (!/^Bearer /i.test(t)) t = 'Bearer ' + t;
    const r = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count', {
      headers: { Authorization: t }
    });
    const j = await r.json();
    if (!r.ok) return res.status(400).json(j);
    res.json((j.data && j.data.user) || j);
  } catch (e) { res.status(500).json({ error: 'falha me' }); }
});

app.listen(process.env.PORT || 3000, () => console.log('tikgrow-api on'));
