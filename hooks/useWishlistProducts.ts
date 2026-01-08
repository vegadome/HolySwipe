// src/hooks/useWishlistProducts.ts
import { Product } from "@/types";
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";
import { supabase } from '../lib/supabase';

export const useWishlistProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        // 🔑 Charger les IDs likés
        let likedIds: string[] = [];
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const {  data: userLikes } = await supabase
            .from('likes')
            .select('product_id')
            .eq('user_id', user.id);
          likedIds = userLikes?.map(l => l.product_id) || [];
        } else {
          const likedStr = await SecureStore.getItemAsync('liked_ids');
          likedIds = likedStr ? JSON.parse(likedStr) : [];
        }

        if (likedIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // 🔥 Appel à la nouvelle Edge Function (méthode POST)
        const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/get-products-by-ids`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: likedIds }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        const  Product: any[] = await response.json();
        setProducts(data);
      } catch (err: any) {
        console.error('Erreur chargement wishlist:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  return { products, loading, error };
};