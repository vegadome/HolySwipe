import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { SwipeableProductCard } from '../../components/SwipeableProductCard';
import { mockProducts } from '../../data/mockProducts';
import { Product } from '../../types';
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
        const prefs = prefsStr ? JSON.parse(prefsStr) : { styles: [], colors: [], brands: [], size: '' };
        const likedStr = await SecureStore.getItemAsync('liked_ids');
        const liked: string[] = likedStr ? JSON.parse(likedStr) : [];

        setLikedIds(liked);
        const feed = getPersonalizedFeed(prefs, liked);
        setProducts(feed.length > 0 ? feed : mockProducts);
      } catch (error) {
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
      await SecureStore.setItemAsync('liked_ids', JSON.stringify(newLiked));
    }

    if (currentIndex < products.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      Alert.alert('Fin du catalogue', 'Revenez demain pour de nouvelles pépites !');
    }
  };

  const currentProduct = products[currentIndex];

  if (!currentProduct) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DÉCOUVRIR</Text>
      </View>

      <View style={styles.cardWrapper}>
        <SwipeableProductCard
          key={currentProduct.id} // ✅ Crucial pour réinitialiser la position
          product={currentProduct}
          onSwipe={handleSwipe}
          onViewDetails={() => router.push(`/product/${currentProduct.id}`)}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.counter}>
          {currentIndex + 1} SUR {products.length}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Design sombre
  },
  header: {
    paddingTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 4,
  },
  cardWrapper: {
    flex: 1, // ✅ Prend tout l'espace central
    justifyContent: 'center', // ✅ Centre la carte verticalement
    alignItems: 'center', // ✅ Centre la carte horizontalement
  },
  footer: {
    paddingBottom: 30,
  },
  counter: {
    textAlign: 'center',
    color: '#555',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default SwipeFeed;