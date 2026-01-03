// app/(tabs)/liked.tsx

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { mockProducts } from '../../data/mockProducts';
import { Product } from './index'; // ✅ Réutilise l'interface Product déjà définie

const LikedScreen = () => {
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadLiked = async () => {
      try {
        const likedStr = await SecureStore.getItemAsync('liked_ids');
        const likedIds: string[] = likedStr ? JSON.parse(likedStr) : [];

        // Filtrer les produits mockés en fonction des IDs likés
        const liked = mockProducts.filter((product) =>
          likedIds.includes(product.id)
        );

        setLikedProducts(liked);
      } catch (error) {
        console.error('Failed to load liked products', error);
        setLikedProducts([]); // fallback sécurisé
      }
    };

    loadLiked();
  }, []);

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => router.push(`/product/${item.id}`)}
      style={styles.item}
      accessibilityLabel={`View details for ${item.name}`}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.thumb}
        contentFit="cover"
        accessibilityRole="image"
      />
      <View style={styles.text}>
        <Text numberOfLines={1} style={styles.name}>
          {item.name}
        </Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  if (likedProducts.length === 0) {
    return (
      <View style={styles.center}>
        <Text>You haven't liked anything yet!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={likedProducts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      accessibilityLabel="List of liked fashion items"
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: 10 },
  item: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 8,
    elevation: 1, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  text: { marginLeft: 12, justifyContent: 'center' },
  name: { fontWeight: '600' },
  price: { color: '#333', marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default LikedScreen;