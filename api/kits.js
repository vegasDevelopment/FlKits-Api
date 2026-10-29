import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // VERİLERİ GETİR
  if (req.method === 'GET') {
    try {
      let kits = await redis.get('flkits_data') || [];
      return res.status(200).json({ success: true, data: kits });
    } catch (error) {
      return res.status(500).json({ error: 'Veriler çekilemedi' });
    }
  }

  // YENİ EKLE
  if (req.method === 'POST') {
    const { token, team, label, sub, category, url, country, flag } = req.body;

    if (token !== '#Coogle29.10.26') {
      return res.status(401).json({ error: 'Yetkisiz işlem.' });
    }

    try {
      let kits = await redis.get('flkits_data') || [];
      
      const bugununTarihi = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      const newKit = {
        id: Date.now(),
        team,
        label,
        sub,
        category,
        url,
        date: bugununTarihi,
        country: country || 'Bilinmeyen',
        flag: flag || '🏳️'
      };

      kits.unshift(newKit);
      await redis.set('flkits_data', kits);

      return res.status(200).json({ success: true, kit: newKit });
    } catch (error) {
      return res.status(500).json({ error: 'Forma eklenemedi' });
    }
  }

  // SİL
  if (req.method === 'DELETE') {
    const { token, id } = req.body;
    if (token !== '#Coogle29.10.26') return res.status(401).json({ error: 'Yetkisiz işlem.' });

    try {
      let kits = await redis.get('flkits_data') || [];
      kits = kits.filter(kit => kit.id !== id);
      await redis.set('flkits_data', kits);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Silinemedi' });
    }
  }
}
