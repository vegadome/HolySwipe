// app/(tabs)/index.tsx

import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { SwipeableProductCard } from '../../components/SwipeableProductCard';
import { mockProducts } from '../../data/mockProducts';
import { supabase } from '../../lib/supabase'; // ✅ Importe Supabase
import { Product } from '../../types';
import { getPersonalizedFeed } from '../../utils/personalization';

const SwipeFeed = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true); // ✅ Pour le chargement
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        // 🔑 Étape 1 : Vérifie si utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();
        let prefs = { styles: [], colors: [], brands: [], size: '' };
        let liked: string[] = [];

        if (user) {
          // ✅ Utilisateur connecté → charge depuis Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferences')
            .eq('id', user.id)
            .single();

          if (profile?.preferences) {
            prefs = profile.preferences;
          }

          // Charger les likes depuis Supabase
          const {  data: userLikes } = await supabase
            .from('likes')
            .select('product_id')
            .eq('user_id', user.id);

          liked = userLikes?.map(l => l.product_id) || [];
        } else {
          // ⚠️ Utilisateur anonyme → charge depuis SecureStore
          const prefsStr = await SecureStore.getItemAsync('user_preferences');
          prefs = prefsStr ? JSON.parse(prefsStr) : prefs;

          const likedStr = await SecureStore.getItemAsync('liked_ids');
          liked = likedStr ? JSON.parse(likedStr) : [];
        }

        setLikedIds(liked);
        const feed = getPersonalizedFeed(prefs, liked);
        setProducts(feed.length > 0 ? feed : mockProducts);
      } catch (error) {
        console.error('Failed to load data:', error);
        setProducts(mockProducts);
      } finally {
        setLoading(false);
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

      // 🔑 Étape 2 : Sauvegarde le like dans Supabase ou SecureStore
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // ✅ Like connecté → Supabase
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, product_id: currentProduct.id });

        if (error) {
          console.error('Like save error:', error);
          // Optionnel : montrer une alerte
        }
      } else {
        // ⚠️ Like anonyme → SecureStore
        await SecureStore.setItemAsync('liked_ids', JSON.stringify(newLiked));
      }
    }

    if (currentIndex < products.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      Alert.alert('Fin du catalogue', 'Revenez demain pour de nouvelles pépites !');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Chargement...</Text>
      </View>
    );
  }

  const currentProduct = products[currentIndex];
  if (!currentProduct) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Aucun produit disponible</Text>
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
          key={currentProduct.id}
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
    backgroundColor: '#000',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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