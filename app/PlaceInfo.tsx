import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PlaceInfo = () => {
    const router = useRouter();

    // placeholder data - in real app this would come from params or store
    const data = {
        name: 'Place Example',
        seats: 4,
        covered: true,
        type: 'Bench',
        rating: 4.5,
        comment: 'Nice spot near the station',
    };

    const [comments, setComments] = useState<string[]>([
        'Super endroit, calme et propre.',
        'Bon passage, beaucoup de places assises.',
    ]);
    const [newComment, setNewComment] = useState('');
    const [reported, setReported] = useState(false);

    const handleAddComment = () => {
        const trimmed = newComment.trim();
        if (!trimmed) return;
        setComments(prev => [trimmed, ...prev]);
        setNewComment('');
    };

    const handleReport = () => {
        if (reported) {
            Alert.alert('Signalé', 'Ce lieu a déjà été signalé.');
            return;
        }
        Alert.alert('Signaler le lieu', 'Voulez-vous signaler ce lieu ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Oui', onPress: () => { setReported(true); console.log('Reported', data.name); } },
        ]);
    };

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Spot details</Text>
                </View>
                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
                    <Text style={styles.label}>Nom du lieu</Text>
                    <Text style={styles.value}>{data.name}</Text>

                    <Text style={styles.label}>Number of seats</Text>
                    <Text style={styles.value}>{String(data.seats)}</Text>

                    <Text style={[styles.label, { marginTop: 8 }]}>Covered?</Text>
                    <Text style={styles.value}>{data.covered ? 'Yes' : 'No'}</Text>

                    <Text style={[styles.label, { marginTop: 8 }]}>Type</Text>
                    <Text style={styles.value}>{data.type}</Text>

                    <Text style={[styles.label, { marginTop: 8 }]}>Rating</Text>
                    <Text style={styles.value}>{data.rating.toFixed(1)}</Text>

                    <Text style={[styles.label, { marginTop: 8 }]}>Description</Text>
                    <Text style={[styles.value, { marginBottom: 16 }]}>{data.comment}</Text>

                    <View style={styles.reportRow}>
                        <TouchableOpacity style={[styles.reportBtn, reported && styles.reported]} onPress={handleReport} activeOpacity={0.8}>
                            <Text style={[styles.reportBtnText, reported && styles.reportedText]}>{reported ? 'Signalé' : 'Signaler'}</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 4 }]}>Commentaires</Text>
                    {comments.map((c, idx) => (
                        <View key={idx} style={styles.commentItem}>
                            <Text style={styles.commentText}>{c}</Text>
                        </View>
                    ))}

                    <View style={styles.commentForm}>
                        <TextInput
                            value={newComment}
                            onChangeText={setNewComment}
                            placeholder="Ajouter un commentaire..."
                            style={styles.commentInput}
                        />
                        <TouchableOpacity style={styles.addBtn} onPress={handleAddComment} activeOpacity={0.8}>
                            <Text style={styles.addBtnText}>Ajouter</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: 'transparent', alignItems: 'stretch', justifyContent: 'flex-start' },
    card: { flex: 1, backgroundColor: '#f2f2f2', borderRadius: 16, overflow: 'hidden', margin: 12 },
    header: { backgroundColor: '#000', paddingVertical: 12, alignItems: 'center' },
    headerText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    content: { padding: 16 },
    label: { fontSize: 14, color: '#333' },
    value: { fontSize: 16, color: '#000', fontWeight: '700', marginTop: 4 },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    commentItem: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 },
    commentText: { color: '#333' },
    commentForm: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    commentInput: { flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, height: 40, borderWidth: 1, borderColor: '#ddd' },
    addBtn: { marginLeft: 8, backgroundColor: '#8c8c8c', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
    addBtnText: { color: '#fff', fontWeight: '700' },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
    reportBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#ff4d4f', borderRadius: 8 },
    reportBtnText: { color: '#fff', fontWeight: '700' },
    reported: { backgroundColor: '#ccc' },
    reportedText: { color: '#333' },
    reportRow: { alignItems: 'flex-start', marginVertical: 8 },
});

export default PlaceInfo;