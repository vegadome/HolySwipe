// data/mockSales.ts

export interface Sale {
  id: string;
  title: string;
  host: string;
  followers: string;
  viewers: string;
  isLive: boolean;
  avatar: string;
  cover: string;
  date: string;
}

// Listes pour la génération
const saleTitles = [
  'Winds of Destiny', 'Urban Edge Collection', 'Eco Chic Drop', 'Midnight Muse',
  'Golden Hour Edit', 'Desert Bloom', 'Neon Dreams', 'Vintage Revival',
  'Coastal Breeze', 'Metropolitan Glow', 'Boho Sunset', 'Minimalist Luxe',
  'Street Pulse', 'Silk & Stone', 'Autumn Palette', 'Retro Future',
  'Parisian Days', 'Tokyo Nights', 'Scandi Minimal', 'Tropical Escape',
  'Denim Reimagined', 'Linen Story', 'Velvet Season', 'Cotton Comfort',
  'Leather Accent', 'Cashmere Touch', 'Floral Whimsy', 'Monochrome Magic',
  'Earth Tones', 'Pastel Dreams'
];

const hosts = ['Marina', 'Leo', 'Sofia', 'Ethan', 'Chloe', 'Noah', 'Ava', 'Liam', 'Mia', 'James'];

const unsplashIds = [
  '1525507119028', '1541099649105', '1591047139829', '1600572228362',
  '1613317093083', '1468627591752', '1523955893664', '1551333547491',
  '1582314356488', '1563467812186', '1579358518890', '1598755126702',
  '1609893274511', '1621234567890', '1632345678901', '1643456789012',
  '1654567890123', '1665678901234', '1676789012345', '1687890123456'
];

// Helper : formatte un nombre en "1.2k", "25k", etc.
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

// Helper : génère une date aléatoire (2 semaines dans le passé / 1 semaine dans le futur)
const getRandomDate = (): string => {
  const days = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const now = new Date();
  const randomDay = now.getDate() + Math.floor(Math.random() * 21) - 14; // -14 à +7 jours
  const date = new Date(now);
  date.setDate(randomDay);
  return `${date.getDate()} ${days[date.getMonth()]}`;
};

// ✅ Génère 30 ventes uniques
export const mockSales: Sale[] = Array.from({ length: 30 }, (_, i) => {
  const title = saleTitles[i % saleTitles.length];
  const host = hosts[i % hosts.length];
  const followers = formatNumber(Math.floor(Math.random() * 5000) + 500); // 500–5.5k
  const viewers = formatNumber(Math.floor(Math.random() * 200000) + 10000); // 10k–210k
  const isLive = Math.random() > 0.7; // 30% en live
  const unsplashId = unsplashIds[i % unsplashIds.length];

  return {
    id: `sale-${i + 1}`,
    title,
    host,
    followers,
    viewers,
    isLive,
    avatar: `https://images.unsplash.com/photo-${unsplashId}?auto=format&fit=crop&w=100&h=100&q=80`,
    cover: `https://images.unsplash.com/photo-${unsplashId}?auto=format&fit=crop&w=500&q=80`,
    date: getRandomDate()
  };
});