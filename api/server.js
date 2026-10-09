const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'https://tikgrow.onrender.com' }));

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || '';
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://tikgrow.onrender.com/';

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/config', (req, res) => res.json({
  wa: process.env.WA_NUMBER || '',
  pm: process.env.PRICE_M || '',
  ps: process.env.PRICE_S || ''
}));

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'TikGrow2026LariShop';
function cyrb(s){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<s.length;i++){let c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return 4294967296*(2097151&h2)+(h1>>>0)}
app.post('/api/token/check', (req, res) => {
  try {
    let t = String(((req.body || {}).token) || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (t.slice(0, 2) !== 'TG') return res.json({ ok: false, reason: 'formato' });
    let b = t.slice(2);
    if (b.length !== 14) return res.json({ ok: false, reason: 'formato' });
    let R = b.slice(0, 6), S = b.slice(6, 10), E = b.slice(10, 14);
    let s2 = cyrb(TOKEN_SECRET + R + E).toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-4).padStart(4, '0');
    if (s2 !== S) return res.json({ ok: false, reason: 'assinatura' });
    let ex = parseInt(E, 36), now = Math.floor(Date.now() / 864e5);
    return res.json({ ok: ex >= now, exp: ex, reason: ex >= now ? '' : 'expirado' });
  } catch (e) { res.json({ ok: false }); }
});

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
