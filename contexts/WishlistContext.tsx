// contexts/WishlistContext.tsx
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type WishlistContextType = {
  likedIds: Set<string>;
  like: (productId: string) => Promise<void>;
  unlike: (productId: string) => Promise<void>;
  isLoading: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Charger depuis Supabase
        const { data, error } = await supabase
          .from('likes')
          .select('product_id')
          .eq('user_id', user.id);
        if (!error) {
          const ids = new Set(data.map((l: any) => l.product_id));
          setLikedIds(ids);
        }
      } else {
        // Charger depuis SecureStore
        const likedStr = await SecureStore.getItemAsync('liked_ids');
        const ids = likedStr ? new Set(JSON.parse(likedStr)) : new Set();
        setLikedIds(ids);
      }
      setIsLoading(false);
    };
    init();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const persistToSecureStore = async (ids: Set<string>) => {
    await SecureStore.setItemAsync('liked_ids', JSON.stringify(Array.from(ids)));
  };

  const like = async (productId: string) => {
    const newLiked = new Set(likedIds).add(productId);
    setLikedIds(newLiked);

    if (user) {
      await supabase
        .from('likes')
        .insert({ user_id: user.id, product_id: productId });
    } else {
      await persistToSecureStore(newLiked);
    }
  };

  const unlike = async (productId: string) => {
    const newLiked = new Set(likedIds);
    newLiked.delete(productId);
    setLikedIds(newLiked);

    if (user) {
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    } else {
      await persistToSecureStore(newLiked);
    }
  };

  return (
    <WishlistContext.Provider value={{ likedIds, like, unlike, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};