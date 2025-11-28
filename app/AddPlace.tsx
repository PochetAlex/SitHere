import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Platform as RNPlatform,
    ScrollView,
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

const AddPlace = () => {
    const router = useRouter();
    const { width, height } = useWindowDimensions();
    const STATUS_BAR_HEIGHT = Platform.OS === 'android'
        ? StatusBar.currentHeight ?? Math.round(height * 0.03)
        : Math.round(height * 0.045);

    const [name, setName] = useState('');
    const [seats, setSeats] = useState('');
    const [covered, setCovered] = useState(false);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0); // 0 .. 5 step 0.5
    const params = useLocalSearchParams();
    // read optional lat/lng query params (passed from homepage when a point was selected)
    const latParam = params?.lat;
    const lngParam = params?.lng;
    const prefilledCoords = latParam && lngParam ? { latitude: parseFloat(latParam as string), longitude: parseFloat(lngParam as string) } : null;

    const [publishing, setPublishing] = useState(false);

    const handlePublish = async () => {
        if (!name.trim()) {
            Alert.alert('Validation', 'Le nom du lieu est requis.');
            return;
        }

        setPublishing(true);
        try {
            // get current user id
            const { data: userData } = await supabase.auth.getUser();
            const user = (userData as any)?.user ?? null;
            const userId = user?.id ?? null;

            const payload: any = {
                name: name.trim(),
                seats: seats ? parseInt(seats, 10) : null,
                covered: !!covered,
                description: comment || null,
                rating: rating || null,
                latitude: prefilledCoords?.latitude ?? null,
                longitude: prefilledCoords?.longitude ?? null,
                user_id: userId,
            };

            const { data, error } = await supabase.from('places').insert([payload]).select().single();
            if (error) {
                console.warn('Insert place error', error);
                Alert.alert('Erreur', error.message || 'Impossible d\'enregistrer le lieu');
            } else {
                Alert.alert('Succès', 'Lieu enregistré', [{ text: 'OK', onPress: () => router.push('/Homepage') }]);
            }
        } catch (e: any) {
            console.warn('Publish exception', e);
            Alert.alert('Erreur', e?.message || String(e));
        } finally {
            setPublishing(false);
        }
    };

    return (
            <SafeAreaView style={styles.screen}>
                <View style={[styles.card]}> 
                {/* Header with rounded top */}
                <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT, backgroundColor: '#000' }]}> 
                    <Text style={[styles.headerText, { color: '#fff' }]}>Add Spot</Text>
                </View>

                <KeyboardAvoidingView behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
                    <Text style={styles.label}>Nom du lieu</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Entrez le nom du lieu"
                        style={styles.input}
                    />

                    <Text style={styles.label}>Number of seats</Text>
                    <TextInput
                        value={seats}
                        onChangeText={setSeats}
                        keyboardType="numeric"
                        placeholder=""
                        style={styles.input}
                    />

                    <View style={styles.rowBetween}>
                        <View style={styles.rowCenter}>
                            <TouchableOpacity
                                onPress={() => setCovered(!covered)}
                                style={[styles.checkbox, covered && styles.checkboxChecked]}
                            >
                                {covered ? <Text style={styles.checkboxMark}>✓</Text> : null}
                            </TouchableOpacity>
                            <Text style={styles.labelSmall}>Covered?</Text>
                        </View>
                    </View>

                    {/* Type selector (placeholder) */}
                    <View style={{ marginTop: 8 }}>
                        <Text style={styles.labelSmall}>Type:</Text>
                        <TouchableOpacity
                            style={styles.pickerBox}
                            onPress={() => {
                                // dropdown to be implemented later; placeholder action
                                console.log('open type dropdown (not implemented)');
                            }}
                        >
                            <Text style={styles.pickerText}>{'Select a type'}</Text>
                            <Text style={styles.pickerChevron}>▾</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Rating (0 - 5 by 0.5) */}
                    <View style={{ marginTop: 10 }}>
                        <Text style={[styles.label, { marginBottom: 6 }]}>Rating</Text>
                        <View style={styles.ratingRow}>
                            <TouchableOpacity
                                style={styles.ratingButton}
                                onPress={() => setRating(prev => Math.max(0, Math.round((prev - 0.5) * 2) / 2))}
                            >
                                <Text style={styles.ratingBtnText}>-</Text>
                            </TouchableOpacity>

                            <View style={styles.ratingValueBox}>
                                <Text style={styles.ratingValueText}>{rating.toFixed(1)}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.ratingButton}
                                onPress={() => setRating(prev => Math.min(5, Math.round((prev + 0.5) * 2) / 2))}
                            >
                                <Text style={styles.ratingBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={[styles.label, { marginTop: 8 }]}>Image</Text>


                    <TouchableOpacity style={styles.cameraBox} activeOpacity={0.8}>
                        <Text style={styles.cameraIcon}>📷</Text>
                    </TouchableOpacity>

                    <Text style={[styles.label, { marginTop: 8 }]}>Description</Text>
                    <TextInput
                        value={comment}
                        onChangeText={setComment}
                        placeholder=""
                        multiline
                        style={[styles.input, styles.textArea]}
                    />

                    <TouchableOpacity style={styles.publishButton} onPress={handlePublish} activeOpacity={0.8}>
                        <Text style={styles.publishText}>Publish</Text>
                    </TouchableOpacity>
                </ScrollView>
                </KeyboardAvoidingView>

                {/* bottom home indicator (visual only) */}
                <View style={styles.bottomIndicatorContainer} pointerEvents="none">
                    <View style={styles.bottomIndicator} />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
        screen: { flex: 1, backgroundColor: 'transparent', alignItems: 'stretch', justifyContent: 'flex-start' },
        card: {
            flex: 1,
            backgroundColor: '#f2f2f2',
            borderRadius: 16,
            overflow: 'hidden',
        // give a subtle shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
            elevation: 4,
    },
    header: {
        backgroundColor: '#e6e6e6',
        paddingVertical: 12,
        alignItems: 'center',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    headerText: { fontSize: 18, fontWeight: '600' },
    content: { padding: 16 },
    label: { fontSize: 14, marginBottom: 6, color: '#333' },
    labelSmall: { fontSize: 14, marginLeft: 8, color: '#333' },
    input: {
        backgroundColor: '#fff',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ddd',
        height: 42,
        paddingHorizontal: 10,
        marginBottom: 8,
    },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: 10 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
    rowCenter: { flexDirection: 'row', alignItems: 'center' },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#bbb',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: { backgroundColor: '#4a4a4a', borderColor: '#4a4a4a' },
    checkboxMark: { color: '#fff', fontWeight: '700' },
    hint: { color: '#888', fontWeight: '700' },
    cameraBox: {
        height: 120,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fafafa',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 12,
    },
    cameraIcon: { fontSize: 32, color: '#888' },
    pickerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: '#fff',
        marginTop: 6,
    },
    pickerText: { color: '#333' },
    pickerChevron: { color: '#666', marginLeft: 8 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
    ratingButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    ratingBtnText: { fontSize: 20, fontWeight: '700' },
    ratingValueBox: {
        minWidth: 64,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    ratingValueText: { fontSize: 16, fontWeight: '700' },
    publishButton: {
        backgroundColor: '#8c8c8c',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    publishText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    bottomIndicatorContainer: { alignItems: 'center', paddingVertical: 10 },
    bottomIndicator: { width: 80, height: 6, backgroundColor: '#222', borderRadius: 6, opacity: 0.2 },
});

export default AddPlace;