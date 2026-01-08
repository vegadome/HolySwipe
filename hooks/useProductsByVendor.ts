// src/hooks/useProductsByVendor.ts
import { Product } from "@/types";
import { useEffect, useState } from "react";

export const useProductsByVendor = (vendorId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!vendorId) {
        setLoading(false);
        return;
      }

      try {
        const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
        
        if (!SUPABASE_URL) {
          throw new Error('EXPO_PUBLIC_SUPABASE_URL non défini dans .env');
        }

        // 🔑 PLUS D'AUTHORIZATION HEADER → fonction publique
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/get-vendor-products?vendor_id=${vendorId}`,
          {
            method: 'GET',
            // ⚠️ Aucun header d'authentification → la fonction doit être publique
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data: Product[] = await response.json();
        setProducts(data);
        setError(null);
      } catch (err: any) {
        console.error('Erreur chargement produits marque:', err);
        setError(err.message || 'Impossible de charger les produits');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [vendorId]);

  return { products, loading, error };
};