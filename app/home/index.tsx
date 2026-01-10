import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


// 🔹 Interface pour les données de Supabase
interface PrivateSale {
  id: string;
  vendor_id: string;
  brand_name: string;
  is_live: boolean;
  cover_image: string;
  start_date: string;
  end_date: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { avatarUrl } = useProfile();
  const avatarUri = avatarUrl ? `${avatarUrl}?t=${Date.now()}` : 'https://avatar.iran.liara.run/public/60';
  const safeAvatarUri = typeof avatarUri === 'string' ? avatarUri : 'https://avatar.iran.liara.run/public/60';

  // ✅ États pour les ventes
  const [liveSales, setLiveSales] = useState<PrivateSale[]>([]);
  const [popularSales, setPopularSales] = useState<PrivateSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Animation (inchangée)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // ✅ Charger les ventes depuis Supabase
    const loadSales = async () => {
      try {
        const { data, error } = await supabase
          .from('private_sales')
          .select('*');

        if (error) throw error;

        const live = data.filter((s: { is_live: any; }) => s.is_live);
        const popular = data.filter((s: { is_live: any; }) => !s.is_live).slice(0, 5);

        setLiveSales(live);
        setPopularSales(popular);
      } catch (error) {
        console.error('Erreur chargement ventes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  // ✅ Gestion du loading
  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#fff' }}>Chargement des ventes...</Text>
      </View>
    );
  }

  // ✅ Fonction utilitaire pour l'avatar par défaut
  const getAvatar = (sale: PrivateSale) => {
    // Tu pourras plus tard stocker `avatar_url` dans private_sales
    return 'https://avatar.iran.liara.run/public/60';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoPlaceholder} />
            <Text style={styles.headerText}>HolySwipe</Text>
          </View>

          <View style={styles.headerRight}>
            {/* WISHLIST (Cœur) */}
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => router.push('/home/wishlist')}
            >
              <BlurView intensity={15} tint="light" style={styles.iconBlur}>
                <Text style={styles.navIconText}>♡</Text>
              </BlurView>
            </TouchableOpacity>

            {/* CART (Panier) */}
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => router.push('/home/cart')}
            >
              <BlurView intensity={15} tint="light" style={styles.iconBlur}>
                <Text style={styles.navIconText}>🛒</Text>
                {/* Badge optionnel pour le nombre d'articles */}
                <View style={styles.cartBadge} />
              </BlurView>
            </TouchableOpacity>

            {/* PROFILE AVATAR */}
            <TouchableOpacity onPress={() => router.push('/home/profile')}>
              <View style={styles.avatarBorder}>
                <Image
                  source={{ uri: safeAvatarUri }}
                  style={styles.topAvatar}
                  contentFit="cover"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stories Section */}
        <Text style={styles.sectionLabel}>
          Your <Text style={styles.whiteText}>Sales</Text>
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
          {([...liveSales, ...popularSales]).slice(0, 6).map((sale) => (
            <View key={sale.id} style={styles.storyCircleContainer}>
              <Image 
                source={{ uri: getAvatar(sale) }} 
                style={styles.storyCircle} 
              />
              {!!sale.is_live && <View style={styles.onlineDot} />}
            </View>
          ))}
        </ScrollView>

        {/* Live Section */}
        <Text style={styles.sectionLabel}>
          Sales on <Text style={styles.whiteText}>Live</Text>
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.liveHorizontalScroll}
        >
          {liveSales.map((sale: PrivateSale) => (
            <TouchableOpacity 
              key={sale.id} 
              style={styles.liveCard} 
              onPress={() => router.push(`/sale/${sale.vendor_id}`)}
            >
              <Image 
                source={{ uri: sale.cover_image || 'https://via.placeholder.com/400x600' }} 
                style={styles.liveCover} 
                contentFit="cover" 
              />
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
              />

              <View style={styles.cardOverlay}>
                <BlurView intensity={25} tint="light" style={styles.hostGlass}>
                  <Image 
                    source={{ uri: getAvatar(sale) }} 
                    style={styles.miniAvatar} 
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hostText}>{sale.brand_name}</Text>
                    <Text style={styles.followerText}>10k FOLLOWERS</Text>
                  </View>
                  <TouchableOpacity style={styles.followBtn}>
                    <Text style={styles.followBtnText}>Follow</Text>
                  </TouchableOpacity>
                </BlurView>

                <View>
                  <Text style={styles.liveTitle}>{sale.brand_name?.toUpperCase()}</Text>
                  <View style={styles.statsRow}>
                    <Animated.View 
                      style={[
                        styles.liveBadge, 
                        { transform: [{ scale: pulseAnim }] }
                      ]}
                    >
                      <Text style={styles.liveBadgeText}>LIVE</Text>
                    </Animated.View>
                    <Text style={styles.viewerText}>• 12.5k</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Section */}
        <Text style={styles.sectionLabel}>
          Popular <Text style={styles.whiteText}>Sales</Text>
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularScroll}>
          {popularSales.map((sale) => (
            <TouchableOpacity 
              key={sale.id} 
              style={styles.popularCard}
              onPress={() => router.push(`/sale/${sale.vendor_id}`)}
            >
              <Image 
                source={{ uri: sale.cover_image || 'https://via.placeholder.com/400x600' }} 
                style={styles.popularCover} 
              />
              <View style={styles.dateBadge}>
                <Text style={styles.dateText}>
                  {new Date(sale.start_date).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Bottom Nav */}
      <View style={styles.bottomNavContainer}>
        <BlurView intensity={60} tint="dark" style={styles.bottomNav}>
          <TouchableOpacity><Text style={styles.navIcon}>☰</Text></TouchableOpacity>
          <View style={styles.navMainIcon}><Text style={styles.navIcon}>✨</Text></View>
          <TouchableOpacity><Text style={styles.navIcon}>🔍</Text></TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => router.push('/home/wishlist')}
            activeOpacity={0.7}
          >
            <BlurView intensity={20} tint="light" style={styles.navIconBlur}>
              <Text style={styles.navIcon}>♡</Text> 
              <View style={styles.wishlistDot} />
            </BlurView>
          </TouchableOpacity>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Fond et structure
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, paddingHorizontal: 20 },
  whiteText: { color: '#FFF' },
  
  // Header mis à jour (HolySwipe + Wishlist + Cart + Profile)
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 15, 
    marginBottom: 20 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoPlaceholder: { 
    width: 28, 
    height: 28, 
    backgroundColor: '#E2F163', // Jaune néon HolySwipe
    borderRadius: 8, 
    marginRight: 10, 
    transform: [{ rotate: '15deg' }] 
  },
  headerText: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  
  headerRight: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 // Espacement harmonieux entre les icônes
  },
  
  // Nouveaux styles pour les boutons du Header (Wishlist / Cart)
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  iconBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  navIconText: { fontSize: 18, color: '#FFF' }, // Pour les icônes texte/emoji du header
  
  // Badge de notification pour le panier
  cartBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2F163',
    shadowColor: '#E2F163',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  // Avatar du Header
  avatarBorder: {
    padding: 2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  topAvatar: { width: 36, height: 36, borderRadius: 12 },

  // Stories
  sectionLabel: { color: '#444', fontSize: 13, fontWeight: '900', letterSpacing: 1, marginBottom: 15, marginTop: 15 },
  storiesContainer: { marginBottom: 25 },
  storyCircleContainer: { marginRight: 15, position: 'relative' },
  storyCircle: { width: 65, height: 65, borderRadius: 22, borderWidth: 1, borderColor: '#333' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, backgroundColor: '#4CAF50', borderRadius: 7, borderWidth: 3, borderColor: '#000' },

  // Cards Live (Motion Design Style)
  liveHorizontalScroll: { overflow: 'visible' },
  liveCard: { width: 280, height: 400, borderRadius: 35, marginRight: 20, overflow: 'hidden', position: 'relative' },
  liveCover: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  cardOverlay: { position: 'absolute', inset: 0, padding: 15, justifyContent: 'space-between' },
  
  hostGlass: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 8, 
    borderRadius: 22, 
    gap: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)' 
  },
  miniAvatar: { width: 32, height: 32, borderRadius: 16 },
  hostText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  followerText: { color: '#CCC', fontSize: 9 },
  followBtn: { backgroundColor: '#E2F163', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  followBtnText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
  
  liveTitle: { color: '#FFF', fontSize: 30, fontWeight: '900', letterSpacing: -1, marginBottom: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveBadge: {
    backgroundColor: '#FF4500', 
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#FF4500',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5, 
  },
  liveBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  viewerText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  // Popular Section
  popularCard: { width: 180, height: 240, borderRadius: 25, marginRight: 15, overflow: 'hidden' },
  popularCover: { width: '100%', height: '100%' },
  dateBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#007AFF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  dateText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  // Bottom Navigation (Glassmorphism)
  bottomNavContainer: { position: 'absolute', bottom: 35, left: 20, right: 20, height: 75 },
  bottomNav: { 
    flex: 1, 
    flexDirection: 'row', 
    borderRadius: 38, 
    alignItems: 'center', 
    justifyContent: 'space-around', 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  navButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  navIconBlur: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navIcon: { color: 'white', fontSize: 22, fontWeight: '300' },
  navMainIcon: { width: 54, height: 54, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 27, justifyContent: 'center', alignItems: 'center' },
  navAvatar: { width: 38, height: 38, borderRadius: 19 },
  wishlistDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2F163',
    shadowColor: '#E2F163',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});