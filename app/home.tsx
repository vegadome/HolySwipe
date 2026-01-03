import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { mockSales } from '../data/mockSales';

export default function HomeScreen() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const liveSales = mockSales.filter(s => s.isLive);
  const popularSales = mockSales.filter(s => !s.isLive).slice(0, 5);


  useEffect(() => {
    // Configuration de l'animation en boucle (infini)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1, // Grandit de 10%
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1, // Revient à la taille normale
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoPlaceholder} />
            <Text style={styles.headerText}>Adverse</Text>
          </View>
          {/* CORRECTION ICI : Remplacement de div par View */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={{fontSize: 20}}>🔔</Text>
            </TouchableOpacity>
            <Image source={{ uri: 'https://avatar.iran.liara.run/public/60' }} style={styles.topAvatar} />
          </View>
        </View>

        {/* Stories Section */}
        <Text style={styles.sectionLabel}>Your <Text style={styles.whiteText}>Sales</Text></Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesContainer}>
          {mockSales.slice(0, 6).map((sale) => (
            <View key={sale.id} style={styles.storyCircleContainer}>
              <Image source={{ uri: sale.avatar }} style={styles.storyCircle} />
              <View style={styles.onlineDot} />
            </View>
          ))}
        </ScrollView>

        {/* Live Section */}
        <Text style={styles.sectionLabel}>Sales on <Text style={styles.whiteText}>Live</Text></Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.liveHorizontalScroll}>
          {liveSales.map((sale) => (
            <TouchableOpacity 
              key={sale.id} 
              style={styles.liveCard} 
              onPress={() => router.push(`/sale/${sale.id}`)}
            >
              <Image source={{ uri: sale.cover }} style={styles.liveCover} contentFit="cover" />
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
              />

              <View style={styles.cardOverlay}>
                <BlurView intensity={25} tint="light" style={styles.hostGlass}>
                  <Image source={{ uri: sale.avatar }} style={styles.miniAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hostText}>{sale.host}</Text>
                    <Text style={styles.followerText}>{sale.followers} FOLLOWERS</Text>
                  </View>
                  <TouchableOpacity style={styles.followBtn}>
                    <Text style={styles.followBtnText}>Follow</Text>
                  </TouchableOpacity>
                </BlurView>

                <View>
                  <Text style={styles.liveTitle}>{sale.title.toUpperCase()}</Text>
                  <View style={styles.statsRow}>
                    <Animated.View 
                      style={[
                        styles.liveBadge, 
                        { transform: [{ scale: pulseAnim }] } // Application de l'effet d'échelle
                      ]}
                    >
                      <Text style={styles.liveBadgeText}>LIVE</Text>
                    </Animated.View>
                    <Text style={styles.viewerText}>• {sale.viewers}k</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Section */}
        <Text style={styles.sectionLabel}>Popular <Text style={styles.whiteText}>Sales</Text></Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularScroll}>
          {popularSales.map((sale) => (
            <TouchableOpacity key={sale.id} style={styles.popularCard}>
              <Image source={{ uri: sale.cover }} style={styles.popularCover} />
              <View style={styles.dateBadge}><Text style={styles.dateText}>{sale.date}</Text></View>
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
          <TouchableOpacity><Text style={styles.navIcon}>🔔</Text></TouchableOpacity>
          <Image source={{ uri: 'https://avatar.iran.liara.run/public/60' }} style={styles.navAvatar} />
        </BlurView>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, paddingHorizontal: 20 },
  whiteText: { color: '#FFF' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoPlaceholder: { width: 30, height: 30, backgroundColor: '#FFD700', borderRadius: 8, marginRight: 10, transform: [{ rotate: '45deg' }] },
  headerText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  topAvatar: { width: 40, height: 40, borderRadius: 12 },
  
  sectionLabel: { color: '#888', fontSize: 16, marginBottom: 15, marginTop: 15 },
  
  storiesContainer: { marginBottom: 25 },
  storyCircleContainer: { marginRight: 15, position: 'relative' },
  storyCircle: { width: 65, height: 65, borderRadius: 22, borderWidth: 1, borderColor: '#333' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, backgroundColor: '#4CAF50', borderRadius: 7, borderWidth: 3, borderColor: '#000' },

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
    // Ajout d'une légère ombre pour le faire ressortir pendant l'animation
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5, 
  },
  liveBadgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  viewerText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

  popularCard: { width: 180, height: 240, borderRadius: 25, marginRight: 15, overflow: 'hidden' },
  popularCover: { width: '100%', height: '100%' },
  dateBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#007AFF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  dateText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

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
  navIcon: { color: 'white', fontSize: 20 },
  navMainIcon: { width: 54, height: 54, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 27, justifyContent: 'center', alignItems: 'center' },
  navAvatar: { width: 38, height: 38, borderRadius: 19 },
  
});