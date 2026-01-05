import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const CheckEmailScreen = () => {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const { email } = useLocalSearchParams<{ email: string }>();

  const handleResendEmail = async () => {
    setSending(true);
    try {
      // Simulation d'envoi
      setTimeout(() => {
        Alert.alert('Email renvoyé', 'Vérifiez à nouveau votre boîte de réception.');
        setSending(false);
      }, 1500);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de renvoyer l’email.');
      setSending(false);
    }
  };

  const openMailApp = () => {
    // Tente d'ouvrir les apps mail courantes
    if (Platform.OS === 'ios') {
      Linking.openURL('message://').catch(() => {
        Linking.openURL('mailto:');
      });
    } else {
      Linking.openURL('mailto:');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0f0f0f', '#000']} style={StyleSheet.absoluteFill} />
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icône enveloppe avec effet Glass */}
        <View style={styles.iconContainer}>
          <BlurView intensity={20} tint="light" style={styles.iconBlur}>
            <View style={styles.iconInner}>
               <Text style={styles.iconEmoji}>✉️</Text>
            </View>
          </BlurView>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>VÉRIFIEZ VOS EMAILS</Text>
          
          <Text style={styles.subtitle}>
            Nous avons envoyé un lien magique à :
          </Text>
          
          <BlurView intensity={10} tint="light" style={styles.emailBadge}>
            <Text style={styles.emailText}>{email || 'votre@email.com'}</Text>
          </BlurView>

          <Text style={styles.instruction}>
            Cliquez sur le lien dans le message pour activer votre compte et commencer votre expérience.
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={openMailApp}
          >
            <Text style={styles.primaryButtonText}>OUVRIR MA BOÎTE MAIL</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryButton, sending && styles.disabled]} 
            onPress={handleResendEmail}
            disabled={sending}
          >
            <Text style={styles.secondaryButtonText}>
              {sending ? 'ENVOI EN COURS...' : 'RENVOYER L’EMAIL'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/auth')}
        >
          <Text style={styles.backText}>← Retour à la connexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Import nécessaire pour la détection de l'OS
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 80,
    paddingBottom: 40,
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
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(226, 241, 99, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 40,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 15,
  },
  emailBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 25,
    overflow: 'hidden',
  },
  emailText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E2F163',
  },
  instruction: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 50,
    paddingHorizontal: 10,
  },
  buttonGroup: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#E2F163',
    paddingVertical: 20,
    borderRadius: 22,
    alignItems: 'center',
    shadowColor: '#E2F163',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
  backButton: {
    marginTop: 40,
    padding: 10,
  },
  backText: {
    color: '#444',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CheckEmailScreen;