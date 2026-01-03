import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Product } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = 600;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeableProductCardProps {
  product: Product;
  onSwipe: (direction: 'left' | 'right') => void;
  onViewDetails: () => void;
}

export const SwipeableProductCard: React.FC<SwipeableProductCardProps> = ({
  product,
  onSwipe,
  onViewDetails,
}) => {
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  
  // Correction de l'erreur : useSharedValue pour être accessible sur le UI Thread
  const hasImpacted = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotation.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-15, 0, 15],
        Extrapolation.CLAMP
      );

      // Gestion de la vibration sans erreur de référence
      const isOverThreshold = Math.abs(event.translationX) > SWIPE_THRESHOLD;
      
      if (isOverThreshold && !hasImpacted.value) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        hasImpacted.value = true;
      } else if (!isOverThreshold && hasImpacted.value) {
        hasImpacted.value = false;
      }
    })
    .onEnd((event) => {
      const isSwipeRight = event.translationX > SWIPE_THRESHOLD || event.velocityX > 800;
      const isSwipeLeft = event.translationX < -SWIPE_THRESHOLD || event.velocityX < -800;

      if (isSwipeRight || isSwipeLeft) {
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        
        const direction = isSwipeRight ? 1 : -1;
        
        translateX.value = withTiming(
          direction * (SCREEN_WIDTH + 150), 
          { duration: 200 }, 
          (finished) => {
            if (finished) {
              runOnJS(onSwipe)(isSwipeRight ? 'right' : 'left');
              
              // 💡 RÉINITIALISATION : On remet la carte au centre invisiblement 
              // pour que la suivante apparaisse au bon endroit si la Key ne change pas.
              translateX.value = 0;
              rotation.value = 0;
              hasImpacted.value = false;
            }
          }
        );
      } else {
        translateX.value = withSpring(0, { damping: 15 });
        rotation.value = withSpring(0);
        hasImpacted.value = false;
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const yeahOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 50], [0, 1], Extrapolation.CLAMP),
  }));

  const nahOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -50], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.containerWrapper}>
      {/* Effet de pile (cartes en dessous) */}
      <View style={[styles.cardPlaceholder, styles.cardUnder1]} />
      <View style={[styles.cardPlaceholder, styles.cardUnder2]} />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <Image source={{ uri: product.image }} style={styles.image} contentFit="cover" />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.95)']}
            style={styles.gradient}
          />

          {/* Labels LIKE/NOPE */}
          <Animated.View style={[styles.statusLabel, styles.likeLabel, yeahOpacity]}>
            <Text style={styles.statusText}>LIKE</Text>
          </Animated.View>
          <Animated.View style={[styles.statusLabel, styles.nopeLabel, nahOpacity]}>
            <Text style={styles.statusText}>NOPE</Text>
          </Animated.View>

          <View style={styles.overlayContent}>
            <BlurView intensity={20} tint="light" style={styles.glassBadge}>
              <Text style={styles.brandText}>{product.brand?.toUpperCase() || 'BRAND'}</Text>
            </BlurView>

            <View style={styles.infoContainer}>
              <Text style={styles.nameText}>{product.name.toUpperCase()}</Text>
              
              <View style={styles.bottomRow}>
                <Text style={styles.priceText}>{product.price}€</Text>
                <TouchableOpacity onPress={onViewDetails} style={styles.detailsBtn}>
                  <BlurView intensity={40} tint="dark" style={styles.btnBlur}>
                    <Text style={styles.btnText}>DETAILS</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    width: SCREEN_WIDTH, // On prend toute la largeur pour centrer facilement
    height: CARD_HEIGHT + 40, // On laisse de la place pour les débordements de la pile
    alignItems: 'center', // Centre horizontalement le contenu
    justifyContent: 'center', // Centre verticalement le contenu
    marginTop: 20,
    position: 'relative',
  },
  cardPlaceholder: {
    position: 'absolute',
    borderRadius: 40,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    // On retire alignSelf: 'center' car le parent a alignItems: 'center'
  },
  cardUnder1: {
    width: CARD_WIDTH * 0.94, // Utilise la constante de largeur pour plus de précision
    height: CARD_HEIGHT * 0.9,
    bottom: 10, // Ajustez pour l'effet de pile
    zIndex: -1,
    opacity: 0.6,
  },
  cardUnder2: {
    width: CARD_WIDTH * 0.88,
    height: CARD_HEIGHT * 0.8,
    bottom: 0,
    zIndex: -2,
    opacity: 0.3,
  },
  card: {
    width: CARD_WIDTH, // Utilise explicitement la largeur définie
    height: CARD_HEIGHT,
    borderRadius: 40,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  image: { ...StyleSheet.absoluteFillObject },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
  },
  overlayContent: {
    flex: 1,
    padding: 25,
    justifyContent: 'space-between',
  },
  glassBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  brandText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  infoContainer: { marginBottom: 10 },
  nameText: { color: '#FFF', fontSize: 34, fontWeight: '900', lineHeight: 36, letterSpacing: -1, marginBottom: 12 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { color: '#E2F163', fontSize: 26, fontWeight: 'bold' },
  detailsBtn: { borderRadius: 20, overflow: 'hidden' },
  btnBlur: { paddingHorizontal: 20, paddingVertical: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  statusLabel: { position: 'absolute', top: 120, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15, borderWidth: 4, zIndex: 10 },
  likeLabel: { left: 30, borderColor: '#4CAF50', transform: [{ rotate: '-15deg' }] },
  nopeLabel: { right: 30, borderColor: '#FF4500', transform: [{ rotate: '15deg' }] },
  statusText: { fontSize: 32, fontWeight: '900', color: '#FFF' },
});