// components/SwipeableProductCard.tsx

import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { Product } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeableProductCardProps {
  product: Product;
  onSwipe: (direction: 'left' | 'right') => void;
  onViewDetails: () => void;
}

// 💖 Composant cœur animé
const HeartAnimation = () => {
  return (
    <Animated.View
      entering={SlideInDown.duration(400).springify()}
      style={styles.heartContainer}
    >
      <Text style={styles.heart}>❤️</Text>
    </Animated.View>
  );
};

export const SwipeableProductCard: React.FC<SwipeableProductCardProps> = ({
  product,
  onSwipe,
  onViewDetails,
}) => {
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const [showHeart, setShowHeart] = useState(false);

  const panGesture = Gesture.Pan()
  .onUpdate((event) => {
    translateX.value = event.translationX;
    rotation.value = interpolate(
      event.translationX,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-25, 0, 25],
      Extrapolation.CLAMP
    );
  })
  .onEnd((event) => {
    const isSwipeRight = event.translationX > SWIPE_THRESHOLD || event.velocityX > 800;
    const isSwipeLeft = event.translationX < -SWIPE_THRESHOLD || event.velocityX < -800;

    if (isSwipeRight || isSwipeLeft) {
      const direction = isSwipeRight ? 1 : -1;
      
      // 🚀 Animation de sortie ultra rapide et fluide
      translateX.value = withTiming(
        direction * (SCREEN_WIDTH + 200), 
        { duration: 200 }, 
        (finished) => {
          if (finished) {
            runOnJS(onSwipe)(isSwipeRight ? 'right' : 'left');
            // Optionnel : réinitialiser les valeurs pour la prochaine carte si le composant est réutilisé
            translateX.value = 0;
            rotation.value = 0;
          }
        }
      );
    } else {
      // ↩️ Retour élastique si abandonné
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      rotation.value = withSpring(0);
    }
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }, // ✅ Appliquer le scale
      ],
    };
  });

  const nahOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, -SWIPE_THRESHOLD * 0.7],
      [0, 1],
      Extrapolation.CLAMP
    ),
    transform: [
      { rotate: '15deg' },
      { scale: interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0.9, 1.1], Extrapolation.CLAMP) }
    ],
  }));

  const yeahOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 0.7], // Apparaît très vite
      [0, 1],
      Extrapolation.CLAMP
    ),
    transform: [
      { rotate: '-15deg' }, 
      { scale: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0.9, 1.1], Extrapolation.CLAMP) }
    ],
  }));

  return (
    <View style={styles.containerWrapper}>
      {/* Overlays "nah" / "yeah" */}
      <Animated.View style={[styles.overlay, styles.nahOverlay, nahOpacity]}>
        <Text style={styles.nahText}>nah</Text>
      </Animated.View>
      <Animated.View style={[styles.overlay, styles.yeahOverlay, yeahOpacity]}>
        <Text style={styles.yeahText}>yeah</Text>
      </Animated.View>

      {/* ❤️ Cœur animé (uniquement pour le like) */}
      {showHeart && <HeartAnimation />}

      {/* Carte principale */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            contentFit="cover"
          />

          {/* Labels "YEAH" et "NAH" à l'intérieur de la carte */}
          <Animated.View style={[styles.labelContainer, styles.yeahLabelPos, yeahOpacity]}>
            <Text style={styles.yeahLabelText}>LIKE</Text>
          </Animated.View>

          <Animated.View style={[styles.labelContainer, styles.nahLabelPos, nahOpacity]}>
            <Text style={styles.nahLabelText}>NOPE</Text>
          </Animated.View>

          <View style={styles.info}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.price}>${product.price}</Text>
          </View>
          <TouchableOpacity onPress={onViewDetails} style={styles.detailsBtn}>
            <Text style={{ color: '#4a90e2' }}>View Details</Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    width: CARD_WIDTH,
    height: 550, // un peu plus grand pour le cœur
    alignSelf: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: 400,
  },
  info: {
    padding: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  brand: {
    color: '#666',
    marginVertical: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eco: {
    color: 'green',
    marginTop: 6,
  },
  detailsBtn: {
    padding: 10,
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  nahOverlay: {
    backgroundColor: 'rgba(255, 100, 100, 0.15)',
  },
  yeahOverlay: {
    backgroundColor: 'rgba(100, 255, 150, 0.15)',
  },
  nahText: {
    fontSize: 56,
    fontWeight: '800',
    color: '#ff6666',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowRadius: 4,
    letterSpacing: -2,
  },
  yeahText: {
    fontSize: 56,
    fontWeight: '800',
    color: '#66dd99',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowRadius: 4,
    letterSpacing: -2,
  },

  labelContainer: {
    position: 'absolute',
    top: 40,
    borderWidth: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 100,
  },
  yeahLabelPos: {
    left: 30,
    borderColor: '#66dd99',
  },
  nahLabelPos: {
    right: 30,
    borderColor: '#ff6666',
  },
  yeahLabelText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#66dd99',
    textTransform: 'uppercase',
  },
  nahLabelText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ff6666',
    textTransform: 'uppercase',
  },

    // ❤️ Cœur
  heartContainer: {
    position: 'absolute',
    top: 100,
    zIndex: 10,
  },
  heart: {
    fontSize: 64,
    opacity: 0.9,
  },
  
});