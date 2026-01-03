// app/product/[id].tsx

import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { mockProducts } from '../../data/mockProducts';
import { Product } from '../../types';

const ProductDetail = () => {
  // useLocalSearchParams renvoie des strings ou undefined
  const { id } = useLocalSearchParams<{ id: string }>();
  const product: Product | undefined = mockProducts.find((p) => p.id === id);
  const router = useRouter();

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const handlePurchase = () => {
    // Dans un MVP : simulation via alerte
    Alert.alert('Purchase Simulated', 'In real app, this would checkout or open web.');
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        contentFit="contain"
        accessibilityLabel={product.name}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.price}>${product.price}</Text>
        {product.ecoFriendly && (
          <Text style={styles.eco}>🌱 Sustainable choice</Text>
        )}
        <Text style={styles.sizes}>Sizes: {product.size.join(', ')}</Text>
        <TouchableOpacity onPress={handlePurchase} style={styles.buyBtn}>
          <Text style={{ color: '#fff', textAlign: 'center' }}>Buy Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back to feed"
        >
          <Text>← Back to Feed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 400 },
  info: { padding: 20 },
  name: { fontSize: 22, fontWeight: 'bold' },
  brand: { color: '#666', marginVertical: 6 },
  price: { fontSize: 20, fontWeight: '600', color: '#333' },
  eco: { color: 'green', marginVertical: 8 },
  sizes: { marginVertical: 8, color: '#555' },
  buyBtn: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
  },
  backBtn: { padding: 10, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ProductDetail;