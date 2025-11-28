import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const STATUS_BAR_HEIGHT = Platform.OS === 'android'
    ? StatusBar.currentHeight ?? Math.round(height * 0.03)
    : Math.round(height * 0.045);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
        // log full response for debugging
        console.warn('signUp result', { data, error });
        if (error) {
          // show more details to help diagnose database/trigger errors
          const details = JSON.stringify({ message: error.message, code: (error as any).code, details: (error as any).details, hint: (error as any).hint }, null, 2);
          Alert.alert('Erreur inscription', details);
          setLoading(false);
          return;
        }
        Alert.alert('Inscription', 'Votre compte a bien été créé.');
        // After signUp, try to create a profile record in `profiles` table.
        const createProfileForUser = async (userId: string | null) => {
          if (!userId) return;
          // Avatar uploads are currently disabled to avoid storage RLS/permission errors.
          // Profile creation is handled server-side by the DB trigger `handle_new_user`.
          return;
        };

        try {
          let user = (data as any)?.user ?? null;
          if (user && user.id) {
            await createProfileForUser(user.id);
          } else {
            // if there's no immediate user (email confirmation flow), listen for sign-in event
            const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
              if (event === 'SIGNED_IN' && session?.user) {
                await createProfileForUser(session.user.id);
                try { listener.subscription.unsubscribe(); } catch (e) { /* ignore */ }
              }
            });
          }
        } catch (e) {
          console.warn('Error creating profile after signup', e);
        }

        router.push('/Homepage');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/Homepage');
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      const url = (data as any)?.url;
      if (url) {
        // open the browser for OAuth flow
        await Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'Impossible de lancer la connexion Google');
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    // Image picker disabled while avatar uploads are paused.
    Alert.alert('Indisponible', 'La sélection d\'avatar est désactivée pour le moment.');
  };

  return (
    <SafeAreaView style={[styles.screen, { paddingTop: STATUS_BAR_HEIGHT }]}> 
      <View style={styles.card}>
        <Text style={styles.headerText}>{mode === 'signup' ? "Créer un compte" : 'Se connecter'}</Text>

        <View style={styles.content}>
          {mode === 'signup' && (
            <>
              <Text style={styles.label}>Nom d'utilisateur</Text>
              <TextInput value={username} onChangeText={setUsername} style={styles.input} placeholder="Choisis un nom" />
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />

          <Text style={[styles.label, { marginTop: 8 }]}>Mot de passe</Text>
          <TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{mode === 'signup' ? 'S’inscrire' : 'Se connecter'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#db4437', marginTop: 10 }]} onPress={handleGoogle} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Se connecter avec Google</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.ghostButton} onPress={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
            <Text style={styles.ghostText}>{mode === 'signup' ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/Homepage')}>
            <Text style={styles.linkText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent', alignItems: 'stretch', justifyContent: 'center' },
  card: { backgroundColor: '#f7f7f7', borderRadius: 12, marginHorizontal: 16, marginVertical: 12, paddingBottom: 24, paddingTop: 12, alignSelf: 'center', width: '92%', maxWidth: 640 },
  headerText: { fontSize: 20, fontWeight: '700', textAlign: 'center', paddingVertical: 12 },
  content: { paddingHorizontal: 16 },
  label: { fontSize: 14, color: '#333', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 8, height: 44, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ddd' },
  primaryButton: { backgroundColor: '#007AFF', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  primaryText: { color: '#fff', fontWeight: '700' },
  ghostButton: { marginTop: 12, alignItems: 'center' },
  ghostText: { color: '#007AFF', fontWeight: '700' },
  linkButton: { marginTop: 10, alignItems: 'center' },
  linkText: { color: '#666' },
});
