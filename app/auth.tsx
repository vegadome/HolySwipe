import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const AuthLanding = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Fond avec dégradé et formes floues pour accentuer le glassmorphism */}
      <LinearGradient colors={['#0f0f0f', '#000']} style={StyleSheet.absoluteFill} />
      
      {/* Orbe décoratif en arrière-plan (Optionnel pour le look moderne) */}
      <View style={styles.decorativeOrbe} />

      <View style={styles.content}>
        {/* Remplacement du Logo Image par du Texte Stylisé */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoTextMain}>HOLY</Text>
          <Text style={styles.logoTextSub}>SWIPE</Text>
        </View>

        <BlurView intensity={25} tint="light" style={styles.glassCard}>
          <Text style={styles.title}>Votre feed quotidien de mode.</Text>
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/sign-in')}
          >
            <Text style={styles.primaryButtonText}>SE CONNECTER</Text>
          </TouchableOpacity>

          <View style={styles.separatorContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>OU</Text>
            <View style={styles.line} />
          </View>

          {/* Boutons Sociaux Style Glass */}
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Alert.alert('Apple', 'Indisponible dans la démo')}
          >
            <BlurView intensity={20} tint="light" style={styles.socialBlur}>
              <Text style={styles.socialButtonText}>Continuer avec Apple</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Alert.alert('Google', 'Indisponible dans la démo')}
          >
            <BlurView intensity={20} tint="light" style={styles.socialBlur}>
              <Text style={styles.socialButtonText}>Continuer avec Google</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.footerLink}
            onPress={() => router.push('/sign-up')}
          >
            <Text style={styles.footerText}>
              Nouveau ici ? <Text style={styles.linkHighlight}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  decorativeOrbe: {
    position: 'absolute',
    top: '15%',
    right: '-10%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E2F163',
    opacity: 0.1, // Très subtil
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoTextMain: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 8,
  },
  logoTextSub: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E2F163',
    letterSpacing: 10,
    marginTop: -5,
    marginLeft: 5,
  },
  glassCard: {
    width: '100%',
    padding: 30,
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#CCC',
    marginBottom: 35,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  primaryButton: {
    backgroundColor: '#E2F163',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#E2F163',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  orText: {
    color: '#666',
    marginHorizontal: 15,
    fontSize: 12,
    fontWeight: 'bold',
  },
  socialButton: {
    width: '100%',
    height: 55,
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  socialBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footerLink: {
    marginTop: 25,
  },
  footerText: {
    color: '#888',
    fontSize: 13,
  },
  linkHighlight: {
    color: '#E2F163',
    fontWeight: 'bold',
  },
});

export default AuthLanding;