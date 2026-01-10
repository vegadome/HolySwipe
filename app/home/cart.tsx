import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

const CART_ITEMS = [
  { id: '1', name: 'Veste Bomber Satin', brand: 'Prada', price: 1200, size: 'M', image: 'https://picsum.photos/200/300?random=10' },
  { id: '2', name: 'Sneakers Cloud', brand: 'Off-White', price: 580, size: '42', image: 'https://picsum.photos/200/300?random=11' },
];

export default function CartScreen() {
  const router = useRouter();
  const masterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(masterAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, []);

  const subtotal = CART_ITEMS.reduce((sum, item) => sum + item.price, 0);

  const opacity = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const translateY = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0f0f0f', '#000']} style={StyleSheet.absoluteFill} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BlurView intensity={20} tint="light" style={styles.iconBlur}>
            <Text style={styles.backText}>←</Text>
          </BlurView>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MON PANIER</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{CART_ITEMS.length} ARTICLES</Text>

        {CART_ITEMS.map((item, index) => (
          <Animated.View 
            key={item.id} 
            style={[styles.itemCard, { opacity, transform: [{ translateY }] }]}
          >
            <BlurView intensity={10} tint="light" style={styles.glassCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <View>
                  <Text style={styles.brandText}>{item.brand.toUpperCase()}</Text>
                  <Text style={styles.nameText}>{item.name}</Text>
                  <Text style={styles.sizeText}>Taille: {item.size}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>{item.price}€</Text>
                  <TouchableOpacity style={styles.removeBtn}>
                    <Text style={styles.removeText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Checkout Summary Footer */}
      <BlurView intensity={80} tint="dark" style={styles.footerGlass}>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalAmount}>{subtotal}€</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.checkoutBtn}
          onPress={() => console.log('Paiement')}
        >
          <LinearGradient
            colors={['#E2F163', '#B8C53C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text style={styles.checkoutText}>PROCÉDER AU PAIEMENT</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
  },
  headerTitle: { color: '#FFF', fontWeight: '900', letterSpacing: 2, fontSize: 14 },
  backButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  iconBlur: { flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  backText: { color: '#FFF', fontSize: 20 },
  
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 200 },
  sectionTitle: { color: '#444', fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 20 },
  
  itemCard: { marginBottom: 15, borderRadius: 24, overflow: 'hidden' },
  glassCard: { flexDirection: 'row', padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  itemImage: { width: 100, height: 120, borderRadius: 16, backgroundColor: '#111' },
  itemInfo: { flex: 1, marginLeft: 15, justifyContent: 'space-between', paddingVertical: 5 },
  
  brandText: { color: '#E2F163', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  nameText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginTop: 4 },
  sizeText: { color: '#666', fontSize: 12, marginTop: 4 },
  
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  removeBtn: { paddingVertical: 5 },
  removeText: { color: '#FF4B4B', fontSize: 11, fontWeight: '600' },

  footerGlass: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: { color: '#888', fontWeight: '900', letterSpacing: 2, fontSize: 12 },
  totalAmount: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  
  checkoutBtn: { height: 65, borderRadius: 22, overflow: 'hidden', elevation: 10, shadowColor: '#E2F163', shadowOpacity: 0.3, shadowRadius: 15 },
  btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  checkoutText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});