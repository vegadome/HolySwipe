// utils/personalization.ts

import { Product } from '../types';

export interface UserPreferences {
  styles: string[];
  colors: string[];
  brands: string[];
  size: string;
}

/**
 * Génère un feed personnalisé en fonction :
 * - des préférences d’onboarding
 * - des produits likés
 *
 * ✅ Compatible avec :
 *   - Les mockProducts (ancien format : style, color)
 *   - Les vrais produits Saleor (nouveau format : seulement brand, ecoFriendly)
 *
 * Stratégie :
 * - Si aucun like → filtrer par préférences (brands toujours utilisé)
 * - Sinon → recommander par similarité (brands + éco si applicable)
 * 
 * Une fois que tu auras :

    Des tags dynamiques (via attributs Saleor comme category, material, etc.)
    Un moteur de recommandation IA (Étape 5)
 * 
 * 
 * 
 */
export const getPersonalizedFeed = (
  onboardingPrefs: UserPreferences,
  likedIds: string[],
  allProducts: Product[] = []
): Product[] => {
  // Charger les mocks si nécessaire (fallback pour dev/test)
  const products = allProducts.length > 0 
    ? allProducts 
    : require('../data/mockProducts').mockProducts;

  // Filtrer les produits déjà likés
  let candidates = products.filter((p: { id: string; }) => !likedIds.includes(p.id));

  // 🔹 Cas 1 : aucun like → utiliser les préférences d’onboarding
  if (likedIds.length === 0) {
    return candidates.filter((p: { brand: string; style: string; color: string; }) => {
      // Toujours filtrer par marque (existe dans les deux formats)
      if (onboardingPrefs.brands.length > 0 && p.brand) {
        return onboardingPrefs.brands.includes(p.brand);
      }

      // Si on utilise des mocks, on peut aussi filtrer par style/color
      if ('style' in p && 'color' in p) {
        return (
          onboardingPrefs.styles.includes(p.style) ||
          onboardingPrefs.colors.includes(p.color)
        );
      }

      // Sinon, on garde tout (pas de filtre possible)
      return true;
    });
  }

  // 🔹 Cas 2 : construire un profil à partir des likes
  const likedBrands = new Set<string>();
  const likedEco = new Set<boolean>();

  for (const id of likedIds) {
    const product = products.find((p: { id: string; }) => p.id === id);
    if (product) {
      if (product.brand) likedBrands.add(product.brand);
      if (product.ecoFriendly !== undefined) likedEco.add(product.ecoFriendly);
    }
  }

  // Recommander si :
  // - Même marque, OU
  // - Même éco-friendly (si l’utilisateur a liké des éco produits)
  return candidates.filter((p: { brand: string; ecoFriendly: any; }) => {
    const matchBrand = p.brand ? likedBrands.has(p.brand) : false;
    const matchEco = likedEco.size > 0 && likedEco.has(p.ecoFriendly || false);

    // ✅ Priorité forte sur la marque (logique marketplace)
    if (matchBrand) return true;

    // ✅ Bonus : si l’utilisateur aime les produits éco, on favorise les éco
    if (likedEco.has(true) && p.ecoFriendly) return true;

    // 🔜 À étendre plus tard avec des embeddings ou tags dynamiques
    return false;
  });
};