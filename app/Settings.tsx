import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

// Default signed URL for the avatar fallback (provided by user)
const DEFAULT_AVATAR_URL = 'https://zhkrdbvqiuejkqwgmyce.supabase.co/storage/v1/object/sign/avatar/default.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mMDI4N2ExNC05NjE2LTRkNDEtOTg4Zi1hOTBjMmUxYzQ4ZjgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdmF0YXIvZGVmYXVsdC5wbmciLCJpYXQiOjE3NjQzNDgwNjksImV4cCI6MTc5NTg4NDA2OX0.YtwL_Vu75v5VkZYZKck7Qi9fLXdzuX7hDhSOnPGAPG8';

const Settings = () => {
    const router = useRouter();
    const { height } = useWindowDimensions();
    const STATUS_BAR_HEIGHT = Platform.OS === 'android'
        ? StatusBar.currentHeight ?? Math.round(height * 0.03)
        : Math.round(height * 0.045);

    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        let mounted = true;
        const loadUser = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                const user = (data as any)?.user ?? null;
                if (user && mounted) {
                    const meta = (user.user_metadata ?? {}) as any;
                    const uname = meta.username ?? meta.name ?? (user.email ? String(user.email).split('@')[0] : '');
                    const aurl = meta.avatar_url ?? null;
                    if (uname) setName(uname);
                    setIsAuthenticated(true);
                    if (aurl) {
                        setAvatarUrl(aurl);
                        return;
                    }

                    // Use the provided signed default avatar URL as fallback.
                    setAvatarUrl(DEFAULT_AVATAR_URL);
                }
            } catch (e) {
                console.warn('Failed to load supabase user in Settings', e);
            }
        };
        loadUser();
        return () => { mounted = false; };
    }, []);

    const handleSignOut = () => {
        Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Se déconnecter', style: 'destructive', onPress: async () => {
                    try {
                        await supabase.auth.signOut();
                    } catch (e) {
                        console.warn('Sign out error', e);
                    }
                    setName('');
                    setAvatarUrl(null);
                    setIsAuthenticated(false);
                    router.push('/Homepage');
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.card}>
                <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT, backgroundColor: '#000' }]}>
                    <Text style={[styles.headerText, { color: '#fff' }]}>Profile</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.avatarWrap}>
                        <Image
                            source={avatarUrl ? { uri: avatarUrl } : require('../assets/images/icon.png')}
                            style={styles.avatar}
                        />
                    </View>

                    <Text style={styles.pointsLabel}>POINTS</Text>
                    <TextInput value={name} onChangeText={setName} style={styles.nameInput} placeholder="Nom" editable={false} />

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Score')}>
                        <Text style={styles.menuIcon}>💯</Text>
                        <Text style={styles.menuText}>Score</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            if (isAuthenticated) {
                                handleSignOut();
                            } else {
                                router.push('/Auth');
                            }
                        }}
                    >
                        <Text style={styles.menuIcon}>👤</Text>
                        <Text style={styles.menuText}>{isAuthenticated ? 'Se déconnecter' : 'Se connecter'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomIndicatorContainer} pointerEvents="none">
                    <View style={styles.bottomIndicator} />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: 'transparent', alignItems: 'stretch', justifyContent: 'flex-start', paddingBottom: 50 },
    card: { flex: 1, backgroundColor: '#f2f2f2', overflow: 'hidden' },
    header: { backgroundColor: '#e6e6e6', paddingVertical: 12, alignItems: 'center', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    headerText: { fontSize: 18, fontWeight: '600' },
    content: { padding: 16, alignItems: 'stretch' },
    avatarWrap: { alignItems: 'center', marginTop: 8, marginBottom: 12 },
    avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#d0d0d0' },
    pointsLabel: { textAlign: 'center', color: '#777', fontWeight: '700', marginTop: 6, marginBottom: 6 },
    nameInput: { backgroundColor: '#fff', borderRadius: 8, height: 42, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ddd' },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8, marginTop: 12, backgroundColor: 'transparent' },
    menuIcon: { fontSize: 22, marginRight: 12, width: 28, textAlign: 'center' },
    menuText: { fontSize: 16, color: '#333' },
    bottomIndicatorContainer: { alignItems: 'center', paddingVertical: 10 },
    bottomIndicator: { width: 80, height: 6, backgroundColor: '#222', borderRadius: 6, opacity: 0.2 },
});

export default Settings;