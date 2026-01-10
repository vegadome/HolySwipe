// app/wishlist.tsx
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Easing,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useWishlist } from '../../contexts/WishlistContext'; // ✅ Nouveau hook global

// Fonction utilitaire pour charger les détails produits depuis les IDs
const fetchProductDetails = async (productIds: string[]): Promise<any[]> => {
  if (productIds.length === 0) return [];
  
  const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/get-products-by-ids`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: productIds }),
  });

  if (!response.ok) throw new Error('Failed to load wishlist products');
  return await response.json();
};

export default function WishlistScreen() {
  const router = useRouter();
  const masterAnim = useRef(new Animated.Value(0)).current;
  const { likedIds, unlike } = useWishlist(); // ✅ État global réactif
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Charger les détails produits dès que likedIds change
  useEffect(() => {
    const loadProducts = async () => {
      if (likedIds.size === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productArray = await fetchProductDetails(Array.from(likedIds));
        setProducts(productArray);
      } catch (err: any) {
        console.error('Erreur chargement wishlist:', err);
        setError(err.message || 'Impossible de charger les articles');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [likedIds]); // ✅ Réagit automatiquement aux likes/délikes

  // Animation d'entrée
  useEffect(() => {
    Animated.timing(masterAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const removeFromWishlist = async (id: string) => {
    try {
      await unlike(id); // ✅ Supprime via le contexte (gère Supabase + SecureStore)
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      console.error('Erreur suppression:', err);
      Alert.alert('Erreur', 'Impossible de supprimer l’article');
    }
  };

  const buySelected = () => {
    if (selectedIds.size === 0) {
      Alert.alert('Sélection vide', 'Choisissez au moins un article');
      return;
    }
    
    const ids = Array.from(selectedIds);
    router.push({
      pathname: '/home/cart',
      params: { productIds: JSON.stringify(ids) },
    });
  };

  const opacity = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const translateY = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedIds.has(item.id);
    
    return (
      <Animated.View style={[styles.cardContainer, { opacity, transform: [{ translateY }] }]}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          style={styles.cardTouchable}
          onPress={() => toggleSelect(item.id)}
        >
          <BlurView intensity={15} tint="light" style={styles.glassCard}>
            <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" />
            
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedIcon}>✓</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                removeFromWishlist(item.id);
              }}
            >
              <Text style={styles.deleteIcon}>✕</Text>
            </TouchableOpacity>
            
            <View style={styles.itemDetails}>
              <Text style={styles.brandText}>{item.brand}</Text>
              <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.priceText}>{item.price}€</Text>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0f0f0f', '#000']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BlurView intensity={20} tint="light" style={styles.backBlur}>
            <Text style={styles.backText}>←</Text>
          </BlurView>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WISHLIST</Text>
        {selectedIds.size > 0 ? (
          <TouchableOpacity style={styles.buyButton} onPress={buySelected}>
            <Text style={styles.buyButtonText}>ACHETER ({selectedIds.size})</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={{ color: '#fff' }}>Chargement...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: '#ff4444' }}>Erreur: {error}</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listPadding}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={styles.headerInfo}>
              <Text style={styles.countText}>
                {products.length} ARTICLE{products.length > 1 ? 'S' : ''} ENREGISTRÉ{products.length > 1 ? 'S' : ''}
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Votre wishlist est vide</Text>
              <Text style={styles.emptySubtext}>Swiper à droite pour ajouter des articles</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// 👇 Styles inchangés (tu peux garder les tiens tels quels)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { color: '#FFF', fontWeight: '900', letterSpacing: 3, fontSize: 14 },
  backButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  backBlur: { flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  backText: { color: '#FFF', fontSize: 20 },
  buyButton: { 
    backgroundColor: '#E2F163', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  buyButtonText: { 
    color: '#000', 
    fontWeight: '800', 
    fontSize: 12, 
    letterSpacing: 1 
  },
  listPadding: { paddingHorizontal: 15, paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between' },
  headerInfo: { paddingVertical: 20, paddingLeft: 5 },
  countText: { color: '#444', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  cardContainer: { width: '48%', marginBottom: 20 },
  cardTouchable: { flex: 1 },
  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    padding: 8,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    backgroundColor: '#111',
  },
  selectedBadge: {
    position: 'absolute',
    top: 15,
    right: 45,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(34, 193, 195, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  selectedIcon: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  deleteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  deleteIcon: { color: '#FFF', fontSize: 16 },
  itemDetails: { padding: 10 },
  brandText: { color: '#E2F163', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  nameText: { color: '#FFF', fontSize: 13, fontWeight: '600', marginVertical: 4 },
  priceText: { color: '#888', fontSize: 12, fontWeight: '500' },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'transparent' 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40 
  },
  emptyText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  emptySubtext: { color: '#666', fontSize: 14, marginTop: 8, textAlign: 'center' },
});