// app/profile.tsx

import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

// Types
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.replace('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUser(profile as UserProfile);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Avatar & Info */}
        <View style={styles.avatarSection}>
          <Image
            source={{ uri: user.avatar_url || 'https://avatar.iran.liara.run/public/60' }}
            style={styles.avatar}
            contentFit="cover"
          />
          <Text style={styles.username}>{user.username || 'Anonymous'}</Text>
        </View>

        {/* Preferences */}
        <ScrollView style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Your Preferences</Text>

          {user.preferences && (
            <>
              <BlurView intensity={40} tint="dark" style={styles.preferenceCard}>
                <Text style={styles.preferenceLabel}>Styles</Text>
                <Text style={styles.preferenceValue}>{user.preferences.styles.join(', ')}</Text>
              </BlurView>

              <BlurView intensity={40} tint="dark" style={styles.preferenceCard}>
                <Text style={styles.preferenceLabel}>Colors</Text>
                <Text style={styles.preferenceValue}>{user.preferences.colors.join(', ')}</Text>
              </BlurView>

              <BlurView intensity={40} tint="dark" style={styles.preferenceCard}>
                <Text style={styles.preferenceLabel}>Brands</Text>
                <Text style={styles.preferenceValue}>{user.preferences.brands.join(', ')}</Text>
              </BlurView>

              <BlurView intensity={40} tint="dark" style={styles.preferenceCard}>
                <Text style={styles.preferenceLabel}>Size</Text>
                <Text style={styles.preferenceValue}>{user.preferences.size}</Text>
              </BlurView>
            </>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  animatedContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    fontSize: 24,
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  preferencesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    marginTop: 10,
  },
  preferenceCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  preferenceLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  preferenceValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 30,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 69, 0, 0.2)', // Orange transparent
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.4)',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF4500',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 50,
  },
});