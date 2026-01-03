// utils/personalization.ts

import { Product } from '../types';

// 🔹 Typage des préférences utilisateur (doit correspondre à ce que tu sauvegardes dans SecureStore)
export interface UserPreferences {
  styles: string[];
  colors: string[];
  brands: string[];
  size: string; // taille unique sélectionnée
}

/**
 * Génère un feed personnalisé en fonction :
 * - des préférences initiales (onboarding)
 * - des produits likés (apprentissage implicite)
 *
 * Stratégie :
 * - Si aucun like : filtrer selon les préférences d’onboarding
 * - Sinon : recommander les produits qui partagent ≥2 tags avec les items likés
 */
export const getPersonalizedFeed = (
  onboardingPrefs: UserPreferences,
  likedIds: string[],
  allProducts: Product[] = []
): Product[] => {
  // Charger les produits mockés si non fournis (utile pour les tests ou fallback)
  const products = allProducts.length > 0 ? allProducts : require('../data/mockProducts').mockProducts;

  // Cas 1 : aucun like → utiliser les préférences d’onboarding
  if (likedIds.length === 0) {
    return products.filter((p) =>
      onboardingPrefs.styles.includes(p.style) ||
      onboardingPrefs.colors.includes(p.color) ||
      onboardingPrefs.brands.includes(p.brand)
    );
  }

  // Cas 2 : construire un profil utilisateur à partir des likes
  const likedStyles = new Set<string>();
  const likedColors = new Set<string>();
  const likedBrands = new Set<string>();

  for (const id of likedIds) {
    const product = products.find((p) => p.id === id);
    if (product) {
      likedStyles.add(product.style);
      likedColors.add(product.color);
      likedBrands.add(product.brand);
    }
  }

  // Recommander si ≥2 attributs correspondent
  return products.filter((p) => {
    let matches = 0;
    if (likedStyles.has(p.style)) matches++;
    if (likedColors.has(p.color)) matches++;
    if (likedBrands.has(p.brand)) matches++;
    return matches >= 2;
  });
};