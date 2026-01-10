import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Fonction utilitaire pour charger les IDs de la wishlist
export const getWishlistIds = async (): Promise<string[]> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from('likes')
      .select('product_id')
      .eq('user_id', user.id);
    
    if (error) throw error;
    return data.map((like: any) => like.product_id);
  } else {
    // ✅ Lire depuis SecureStore si anonyme
    const likedStr = await SecureStore.getItemAsync('liked_ids');
    return likedStr ? JSON.parse(likedStr) : [];
  }
};

// Hook principal
export const useWishlistProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productIds = await getWishlistIds();
        
        if (productIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Appel à ton Edge Function
        const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/get-products-by-ids`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: productIds }),
        });

        if (!response.ok) throw new Error('Erreur chargement produits');
        const productsData = await response.json();
        setProducts(productsData);
      } catch (err: any) {
        console.error('Erreur useWishlistProducts:', err);
        setError(err.message || 'Impossible de charger la wishlist');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []); // Pas de dépendance → chargement initial uniquement

  return { products, loading, error };
};