import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      Alert.alert('Vente terminée', 'Vous avez vu tous les articles de cette sélection.');
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← RETOUR</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VENTE PRIVÉE</Text>
      </View>

      <View style={styles.cardWrapper}>
        <SwipeableProductCard
          key={currentProduct.id}
          product={currentProduct}
          onSwipe={handleSwipe}
          onViewDetails={() => router.push(`/product/${currentProduct.id}`)}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.counter}>
          ITEM {currentIndex + 1} / {products.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  backText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#E2F163', // Ton jaune acide pour le titre de la vente
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center', // ✅ Centre la carte parfaitement au milieu verticalement
    alignItems: 'center',
  },
  footer: {
    paddingBottom: 20,
  },
  counter: {
    textAlign: 'center',
    color: '#444',
    fontSize: 11,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});