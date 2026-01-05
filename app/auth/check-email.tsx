// app/auth/check-email.tsx

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

interface CheckEmailProps {
  email?: string;
}

const CheckEmailScreen: React.FC<CheckEmailProps> = ({}) => {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  // Récupère l'email depuis l'historique ou SecureStore (optionnel)
  const { email } = useLocalSearchParams<{ email: string }>();

  const handleResendEmail = async () => {
    setSending(true);
    try {
      // Tu peux réutiliser la logique de SignUp ici si besoin
      Alert.alert('Email renvoyé', 'Vérifiez à nouveau vos emails.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de renvoyer l’email.');
    } finally {
      setSending(false);
    }
  };

  const openMailApp = () => {
    // Ouvre l'app mail par défaut
    Linking.openURL('message://').catch(() => {
      // Si échec, ouvre une URL générique
      Linking.openURL('mailto:').catch(() => {});
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0f0f0f', '#000']} style={StyleSheet.absoluteFill} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <BlurView intensity={30} tint="light" style={styles.iconBlur}>
            <Text style={styles.icon}>📧</Text>
          </BlurView>
        </View>

        <Text style={styles.title}>Vérifiez vos emails</Text>
        
        <Text style={styles.subtitle}>
          Nous avons envoyé un lien de vérification à :
        </Text>
        
        <Text style={styles.email}>{email}</Text>

        <Text style={styles.instruction}>
          Cliquez sur le lien dans l’email pour activer votre compte.
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.secondaryButton, sending && styles.disabled]} 
            onPress={handleResendEmail}
            disabled={sending}
          >
            <Text style={styles.secondaryButtonText}>
              {sending ? 'Envoi...' : 'Renvoyer l’email'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={openMailApp}>
            <Text style={styles.primaryButtonText}>Ouvrir l’email</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/auth')}>
          <Text style={styles.backText}>← Retour à l’authentification</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 80,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBlur: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(226, 241, 99, 0.3)',
  },
  icon: {
    fontSize: 40,
    color: '#E2F163',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2F163',
    marginBottom: 20,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#E2F163',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#E2F163',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: 'rgba(226, 241, 99, 0.1)',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 241, 99, 0.3)',
  },
  secondaryButtonText: {
    color: '#E2F163',
    fontWeight: '600',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  backButton: {
    padding: 10,
  },
  backText: {
    color: '#888',
    fontSize: 15,
  },
});

export default CheckEmailScreen;