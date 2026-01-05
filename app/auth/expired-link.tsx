import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function ExpiredLinkScreen() {
  const router = useRouter();

  const handleGoBack = () => {
    router.replace('/auth/sign-in');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Fond sombre profond */}
      <LinearGradient colors={['#0f0f0f', '#000']} style={StyleSheet.absoluteFill} />
      
      {/* Cercle décoratif rouge très tamisé pour l'état d'erreur */}
      <View style={styles.errorGlow} />

      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <View style={styles.iconContainer}>
          <BlurView intensity={20} tint="light" style={styles.iconBlur}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>✕</Text>
            </View>
          </BlurView>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>LIEN EXPIRÉ</Text>
          
          <View style={styles.separator} />

          <Text style={styles.subtitle}>
            Désolé, ce lien de sécurité n'est plus valide. 
            {"\n\n"}
            Par mesure de sécurité, les liens de réinitialisation expirent après une utilisation ou 24 heures.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>RETOURNER À LA CONNEXION</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => router.push('/auth/forgot-password')}
        >
          <Text style={styles.secondaryButtonText}>Générer un nouveau lien</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorGlow: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: '#FF4B4B',
    opacity: 0.05, // Très subtil pour ne pas paraître trop "agressif"
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 100,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 50,
  },
  iconBlur: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 75, 75, 0.2)',
    overflow: 'hidden',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 32,
    color: '#FF4B4B',
    fontWeight: '300',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 3,
  },
  separator: {
    width: 40,
    height: 2,
    backgroundColor: '#E2F163',
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  primaryButton: {
    backgroundColor: '#E2F163',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 22,
    alignItems: 'center',
    shadowColor: '#E2F163',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  secondaryButton: {
    padding: 15,
  },
  secondaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});