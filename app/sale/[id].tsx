// app/sale/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useWishlist } from '@/contexts/WishlistContext';
import * as Haptics from 'expo-haptics';
import { Platform, ToastAndroid } from 'react-native';
import { SwipeableProductCard } from '../../components/SwipeableProductCard';
import { useProductsByVendor } from '../../hooks/useProductsByVendor';
import { Product } from '../../types';

export default function SaleDetail() {
  const { id: vendor_id } = useLocalSearchParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { products: vendorProducts, loading: loadingProducts } = useProductsByVendor(vendor_id!);
  const { likedIds, like } = useWishlist(); // ✅ État global réactif

  // Filtrer les produits non likés dès que vendorProducts ou likedIds change
  useEffect(() => {
    if (!loadingProducts) {
      const filtered = vendorProducts.filter(p => !likedIds.has(p.id));
      setProducts(filtered);
      setLoading(false);
    }
  }, [vendorProducts, loadingProducts, likedIds]); // ← Ajout de likedIds comme dépendance

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentProduct = products[currentIndex];
    if (!currentProduct) return;

    if (direction === 'right') {
      // 🔊 Feedback haptique
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // 💬 Notification
      if (Platform.OS === 'android') {
        ToastAndroid.show('✅ Ajouté à ta Wishlist', ToastAndroid.SHORT);
      } else {
        Alert.alert('Wishlist', 'Article ajouté ✅', [{ text: 'OK' }]);
      }

      // ❤️ Ajout via le contexte (persistance + mise à jour globale)
      await like(currentProduct.id);
    }

    // Passer au produit suivant
    if (currentIndex < products.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      Alert.alert('Vente terminée', 'Vous avez vu tous les articles de cette sélection.');
    }
  };

  // ✅ Gestion du loading
  if (loading || loadingProducts) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Chargement de la vente...</Text>
      </View>
    );
  }

  const currentProduct = products[currentIndex];
  if (!currentProduct || products.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Aucun article disponible pour cette marque.</Text>
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
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    position: 'relative',
  },
  backButton: { position: 'absolute', left: 20 },
  backText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  headerTitle: { color: '#E2F163', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  cardWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footer: { paddingBottom: 20 },
  counter: { textAlign: 'center', color: '#444', fontSize: 11, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
});