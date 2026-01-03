// app/sale/[id].tsx
// C’est ici qu’on va lancer ton MVP de swipe, mais en fonction de la vente sélectionnée.

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { SwipeableProductCard } from '../../components/SwipeableProductCard';
import { mockProducts } from '../../data/mockProducts';
import { Product } from '../../types';
import { getPersonalizedFeed } from '../../utils/personalization';

export default function SaleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger préférences utilisateur
        const prefsStr = await SecureStore.getItemAsync('user_preferences');
        const prefs = prefsStr
          ? JSON.parse(prefsStr)
          : { styles: [], colors: [], brands: [], size: '' };

        // Charger likes existants
        const likedStr = await SecureStore.getItemAsync('liked_ids');
        const liked: string[] = likedStr ? JSON.parse(likedStr) : [];

        setLikedIds(liked);

        // 🔥 Ici tu peux filtrer les produits par "saleId"
        // Pour l'instant, on utilise tous les produits (tu pourras ajouter un tag "saleId" plus tard)
        const feed = getPersonalizedFeed(prefs, liked);
        setProducts(feed.length > 0 ? feed : mockProducts);
      } catch (error) {
        console.error('Failed to load data', error);
        setProducts(mockProducts);
      }
    };

    loadData();
  }, []);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentProduct = products[currentIndex];
    if (!currentProduct) return;

    if (direction === 'right') {
      const newLiked = [...likedIds, currentProduct.id];
      setLikedIds(newLiked);
      try {
        await SecureStore.setItemAsync('liked_ids', JSON.stringify(newLiked));
      } catch (err) {
        console.warn('Failed to save liked item', err);
      }
    }

    if (currentIndex < products.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      Alert.alert('No more items', 'Check back tomorrow for new picks!');
    }
  };

  const currentProduct = products[currentIndex];
  if (!currentProduct) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9f9f9', padding: 10 }}>
      <SwipeableProductCard
        product={currentProduct}
        onSwipe={handleSwipe}
        onViewDetails={() => router.push(`/product/${currentProduct.id}`)}
      />
      <Text style={{ textAlign: 'center', marginTop: 10, color: '#888' }}>
        {currentIndex + 1} / {products.length}
      </Text>
    </View>
  );
}