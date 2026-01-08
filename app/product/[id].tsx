import { useSaleorProduct } from '@/hooks/useSaleorProductDetail';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ProductDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loading, error, product } = useSaleorProduct(id!);
  const router = useRouter();

   if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Chargement...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Produit non trouvé</Text>
      </View>
    );
  }

  const handlePurchase = () => {
    Alert.alert('Selectionné !', 'Redirection vers le paiement sécurisé...');
  };

  return (
    <View style={styles.container}>
      {/* Image de fond plein écran */}
      <Image
        source={{ uri: product.image }}
        style={styles.backgroundImage}
        contentFit="cover"
      />

      {/* Bouton Retour Flottant */}
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={styles.floatingBack}
      >
        <BlurView intensity={30} tint="light" style={styles.backBlur}>
          <Text style={styles.backText}>✕</Text>
        </BlurView>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: SCREEN_HEIGHT * 0.45 }} />

        {/* Panneau d'information Glassmorphism */}
        <BlurView intensity={50} tint="dark" style={styles.infoPanel}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'transparent']}
            style={styles.panelHighlight}
          />
          
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.brandText}>{product.brand.toUpperCase()}</Text>
              <Text style={styles.nameText}>{product.name}</Text>
            </View>
            <Text style={styles.priceText}>{product.price}€</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>DESCRIPTION</Text>
          <Text style={styles.descriptionText}>
            Une pièce exclusive alliant confort et design moderne. Parfait pour un style urbain affirmé.
          </Text>

          {product.ecoFriendly && (
            <View style={styles.ecoBadge}>
              <Text style={styles.ecoText}>🌱 Choix Durable</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>TAILLES DISPONIBLES</Text>
          <View style={styles.sizeContainer}>
            {product.size.map((s) => (
              <View key={s} style={styles.sizeBox}>
                <Text style={styles.sizeText}>{s}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity onPress={handlePurchase} style={styles.buyBtn}>
            <Text style={styles.buyBtnText}>ACHETER MAINTENANT</Text>
          </TouchableOpacity>
        </BlurView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: SCREEN_HEIGHT * 0.6,
    top: 0,
  },
  floatingBack: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { flexGrow: 1 },
  infoPanel: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 30,
    minHeight: SCREEN_HEIGHT * 0.6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  panelHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  brandText: { color: '#E2F163', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  nameText: { color: '#FFF', fontSize: 28, fontWeight: '900', marginTop: 5, width: '70%' },
  priceText: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  sectionTitle: { color: '#888', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10, marginTop: 10 },
  descriptionText: { color: '#CCC', fontSize: 15, lineHeight: 22, marginBottom: 20 },
  ecoBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  ecoText: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
  sizeContainer: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  sizeBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeText: { color: '#FFF', fontWeight: 'bold' },
  buyBtn: {
    backgroundColor: '#E2F163',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 'auto',
    shadowColor: '#E2F163',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buyBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
});

export default ProductDetail;