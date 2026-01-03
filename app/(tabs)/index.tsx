// app/(tabs)/index.tsx

import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { SwipeableProductCard } from '../../components/SwipeableProductCard'; // ✅ Nouveau composant
import { mockProducts } from '../../data/mockProducts';
import { Product } from '../../types'; // ✅ Déplacé vers types.ts
import { getPersonalizedFeed } from '../../utils/personalization';

const SwipeFeed = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const prefsStr = await SecureStore.getItemAsync('user_preferences');
        const prefs = prefsStr
          ? JSON.parse(prefsStr)
          : { styles: [], colors: [], brands: [], size: '' };

        const likedStr = await SecureStore.getItemAsync('liked_ids');
        const liked: string[] = likedStr ? JSON.parse(likedStr) : [];

        setLikedIds(liked);
        const feed = getPersonalizedFeed(prefs, liked);
        setProducts(feed.length > 0 ? feed : mockProducts);
      } catch (error) {
        console.error('Failed to load onboarding or liked data', error);
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
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SwipeableProductCard
        product={currentProduct}
        onSwipe={handleSwipe}
        onViewDetails={() => router.push(`/product/${currentProduct.id}`)}
      />
      <Text style={styles.counter}>
        {currentIndex + 1} / {products.length}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center', // Centre verticalement la carte
    alignItems: 'center',
    paddingVertical: 20,
  },
  counter: {
    textAlign: 'center',
    marginTop: 30,
    color: '#888',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SwipeFeed;