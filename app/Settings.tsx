import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

const Settings = () => {
    const router = useRouter();
    const { height } = useWindowDimensions();
    const STATUS_BAR_HEIGHT = Platform.OS === 'android'
        ? StatusBar.currentHeight ?? Math.round(height * 0.03)
        : Math.round(height * 0.045);

    const [name, setName] = useState('Name');

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.card}>
                <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT, backgroundColor: '#000' }]}>
                    <Text style={[styles.headerText, { color: '#fff' }]}>Profile</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.avatarWrap}>
                        <View style={styles.avatar} />
                    </View>

                    <Text style={styles.pointsLabel}>POINTS</Text>
                    <TextInput value={name} onChangeText={setName} style={styles.nameInput} />

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/Score')}>
                        <Text style={styles.menuIcon}>💯</Text>
                        <Text style={styles.menuText}>Score</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => console.log('logout')}>
                        <Text style={styles.menuIcon}>👤</Text>
                        <Text style={styles.menuText}>Logout</Text>
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