import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  preferences: {
    styles: string[];
    colors: string[];
    brands: string[];
    size: string;
  } | null;
  onboarding_complete: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const isFocusedMounted = useRef(true);

  const masterAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      if (isFocusedMounted.current) {
        fetchProfile();
      }
      return () => {};
    }, [])
  );

  const fetchProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      router.replace('/auth/sign-in');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      // ✅ CORRECTION : on utilise avatar_url tel quel (déjà une URL complète)
      setUser({
        ...profile,
        avatar_url: profile.avatar_url, // ← pas de reconstruction manuelle !
      });
    }
    setLoading(false);
    startEntryAnimation();
  };

  const startEntryAnimation = () => {
    Animated.timing(masterAnim, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const triggerEditAnimation = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start(() => {
      router.push('/home/edit-profile'); // ✅ Assure-toi que le chemin est bon
    });
  };

  const handleLogout = async () => {
    Animated.timing(masterAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      await supabase.auth.signOut();
      router.replace('/auth/sign-in');
    });
  };

  const opacity = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const scale = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const translateY = masterAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#0f0f0f', '#000']} style={StyleSheet.absoluteFill} />
        <Text style={styles.loadingText}>CHARGEMENT...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0f0f0f', '#000']} style={StyleSheet.absoluteFill} />

      <Animated.View
        style={[
          styles.mainContent,
          { opacity, transform: [{ scale }, { translateY }] },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonCircle}>
            <BlurView intensity={20} tint="light" style={styles.blurBack}>
              <Text style={styles.backArrow}>←</Text>
            </BlurView>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>PROFIL</Text>

          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TouchableOpacity onPress={triggerEditAnimation} style={styles.editButtonCircle}>
              <BlurView intensity={20} tint="light" style={styles.blurEdit}>
                <Text style={styles.editText}>ÉDITER</Text>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              <Image
                source={{
                  uri: user.avatar_url
                    ? `${user.avatar_url}?t=${Date.now()}` // ✅ Cache-busting propre
                    : 'https://avatar.iran.liara.run/public/60',
                }}
                onLoad={() => setAvatarLoading(false)}
                onError={() => setAvatarLoading(false)}
                style={styles.avatar}
                transition={250}
                contentFit="cover"
              />
              <TouchableOpacity
                style={styles.miniEditBadge}
                onPress={triggerEditAnimation}
                activeOpacity={0.8}
              >
                <Text style={styles.miniIcon}>✎</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.username}>{user.username || 'Utilisateur'}</Text>
            <Text style={styles.userEmail}>Membre Premium</Text>
          </View>

          <Text style={styles.sectionTitle}>PRÉFÉRENCES STYLE</Text>

          <View style={styles.grid}>
            {user.preferences &&
              Object.entries(user.preferences).map(([key, value]) => (
                <BlurView key={key} intensity={10} tint="light" style={styles.glassCard}>
                  <Text style={styles.cardLabel}>{key.toUpperCase()}</Text>
                  <Text style={styles.cardValue} numberOfLines={2}>
                    {Array.isArray(value) ? value.join(' • ') : value}
                  </Text>
                </BlurView>
              ))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <LinearGradient
              colors={['rgba(255, 75, 75, 0.1)', 'rgba(255, 75, 75, 0.05)']}
              style={styles.logoutGradient}
            >
              <Text style={styles.logoutText}>DÉCONNEXION</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// ⚠️ Styles inchangés (tu peux garder les tiens)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#E2F163', fontWeight: '900', letterSpacing: 2 },
  mainContent: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButtonCircle: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  editButtonCircle: { height: 36, borderRadius: 18, overflow: 'hidden' },
  blurBack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  blurEdit: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 241, 99, 0.2)',
  },
  backArrow: { color: '#FFF', fontSize: 20 },
  editText: { color: '#E2F163', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  headerTitle: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  scrollPadding: { paddingBottom: 40, paddingHorizontal: 20 },
  avatarContainer: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  avatarBorder: {
    padding: 4,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#E2F163',
    marginBottom: 15,
    position: 'relative',
  },
  miniEditBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#E2F163',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  miniIcon: { fontSize: 14, color: '#000', fontWeight: 'bold' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  username: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  userEmail: { fontSize: 14, color: '#E2F163', marginTop: 5, fontWeight: '600' },
  sectionTitle: {
    color: '#444',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  glassCard: {
    width: '48%',
    padding: 20,
    borderRadius: 24,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  cardLabel: { color: '#666', fontSize: 9, fontWeight: '800', marginBottom: 8, letterSpacing: 1 },
  cardValue: { color: '#FFF', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  logoutButton: {
    marginTop: 40,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 75, 0.2)',
  },
  logoutGradient: { paddingVertical: 18, alignItems: 'center' },
  logoutText: { color: '#FF4B4B', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});