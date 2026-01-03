// data/mockProducts.ts

import { Product } from '../types'; // ✅ Assure-toi que le chemin est correct

const styles = ['casual', 'formal', 'boho', 'minimal', 'streetwear', 'vintage', 'athleisure', 'elegant'];
const colors = ['black', 'white', 'navy', 'beige', 'olive', 'burgundy', 'pink', 'denim', 'cream', 'charcoal'];
const brands = ['Everlane', 'Reformation', 'Levi’s', 'Zara', 'H&M', 'Patagonia', 'Madewell', 'COS', '&OtherStories', 'Pact'];
const ecoFriendlyBrands = ['Everlane', 'Reformation', 'Patagonia', 'Pact'];

const productDescriptors = [
  'Organic Cotton', 'Recycled Polyester', 'Linen Blend', 'Tencel™', 'Hemp',
  'Deadstock Fabric', 'Vintage-Inspired', 'Minimalist', 'Tailored', 'Relaxed Fit',
  'High-Waisted', 'Wrap', 'Puff Sleeve', 'Oversized', 'Ribbed Knit',
  'Silk-Blend', 'Cropped', 'Utility', 'Ruffled', 'Sustainable'
];

const categories = [
  'Dress', 'Blouse', 'Jeans', 'T-Shirt', 'Sweater', 'Skirt', 'Jumpsuit',
  'Blazer', 'Cardigan', 'Trousers', 'Top', 'Jacket', 'Leggings', 'Coat', 'Tank Top'
];

// Fonction utilitaire pour générer une URL Unsplash réaliste
const getImageUrl = (category: string, index: number): string => {
  const queryMap: Record<string, string> = {
    Dress: 'women+dress',
    Jeans: 'women+jeans',
    Blazer: 'women+blazer',
    Sweater: 'women+sweater',
    Skirt: 'women+skirt',
    Trousers: 'women+pants',
    Jumpsuit: 'women+jumpsuit',
    Jacket: 'women+coat',
    Top: 'women+top',
    Blouse: 'women+blouse'
  };
  const q = queryMap[category] || 'women+fashion';
  return `https://images.unsplash.com/photo-${1525507119028 + (index % 10)}?auto=format&fit=crop&w=500&q=80`;
};

// ✅ Déclaration typée : `mockProducts` est explicitement `Product[]`
export const mockProducts: Product[] = Array.from({ length: 60 }, (_, i) => {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const descriptor = productDescriptors[Math.floor(Math.random() * productDescriptors.length)];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const style = styles[Math.floor(Math.random() * styles.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const price = Math.floor(Math.random() * 120) + 25; // $25–$145
  const ecoFriendly = ecoFriendlyBrands.includes(brand) || Math.random() > 0.7;

  const sizeOptions = [
    ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    ['24', '26', '28', '30', '32'],
    ['0', '2', '4', '6', '8', '10', '12', '14', '16'],
    ['S', 'M', 'L', 'XL']
  ];
  const size = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];

  return {
    id: (i + 1).toString(),
    name: `${descriptor} ${category}`,
    brand,
    price,
    image: getImageUrl(category, i + 1),
    style,
    color,
    size,
    ecoFriendly
  };
});