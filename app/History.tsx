import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

const sampleFavorites = [
    { id: 'f1', title: 'Favorite Spot A', seats: 2, type: 'Bench', covered: true, rating: 4.5 },
    { id: 'f2', title: 'Favorite Spot B', seats: 3, type: 'Table', covered: false, rating: 4.0 },
    { id: 'f3', title: 'Favorite Spot C', seats: 1, type: 'Bench', covered: true, rating: 3.5 },
    { id: 'f4', title: 'Favorite Spot D', seats: 4, type: 'Table', covered: false, rating: 5.0 },
    { id: 'f5', title: 'Favorite Spot E', seats: 2, type: 'Corner', covered: true, rating: 4.2 },
    { id: 'f6', title: 'Favorite Spot F', seats: 6, type: 'Terrace', covered: false, rating: 3.8 },
    { id: 'f7', title: 'Favorite Spot G', seats: 3, type: 'Bench', covered: true, rating: 4.7 },
    { id: 'f8', title: 'Favorite Spot H', seats: 2, type: 'Table', covered: false, rating: 4.1 },
];

const sampleRecent = [
    { id: 'r1', title: 'Recent Spot 1', seats: 1, type: 'Bench', covered: true, rating: 3.5 },
    { id: 'r2', title: 'Recent Spot 2', seats: 4, type: 'Table', covered: false, rating: 4.0 },
    { id: 'r3', title: 'Recent Spot 3', seats: 2, type: 'Corner', covered: false, rating: 2.5 },
    { id: 'r4', title: 'Recent Spot 4', seats: 5, type: 'Terrace', covered: true, rating: 4.8 },
    { id: 'r5', title: 'Recent Spot 5', seats: 2, type: 'Bench', covered: false, rating: 3.9 },
    { id: 'r6', title: 'Recent Spot 6', seats: 3, type: 'Table', covered: true, rating: 4.3 },
    { id: 'r7', title: 'Recent Spot 7', seats: 1, type: 'Bench', covered: false, rating: 2.0 },
    { id: 'r8', title: 'Recent Spot 8', seats: 4, type: 'Corner', covered: true, rating: 4.6 },
];

const ItemCard = ({ item, onPress }: { item: any; onPress?: () => void }) => (
    <TouchableOpacity style={styles.itemCard} activeOpacity={0.8} onPress={onPress}>
        <View style={styles.thumb} />
        <View style={styles.itemText}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <View style={styles.metaRow}>
                <Text style={styles.itemSubtitleLeft}>Seats: {item.seats}</Text>
                <Text style={styles.itemSubtitleRight}>Type: {item.type}</Text>
            </View>
            <View style={styles.metaRow}>
                <Text style={styles.itemSubtitleLeft}>Covered: {item.covered ? 'Yes' : 'No'}</Text>
                <Text style={styles.itemSubtitleRight}>Rating: {item.rating}</Text>
            </View>
        </View>
    </TouchableOpacity>
);

const History = () => {
    const router = useRouter();
    const { height } = useWindowDimensions();
    const STATUS_BAR_HEIGHT = Platform.OS === 'android'
        ? StatusBar.currentHeight ?? Math.round(height * 0.03)
        : Math.round(height * 0.045);

    const [visibleFavorites, setVisibleFavorites] = useState(Math.min(3, sampleFavorites.length));
    const [visibleRecent, setVisibleRecent] = useState(Math.min(3, sampleRecent.length));

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.card}>
                <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT, backgroundColor: '#000' }]}>
                    <Text style={[styles.headerText, { color: '#fff' }]}>History</Text>
                </View>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>

                    <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Favorites</Text>
                    </View>

                    <FlatList
                        data={sampleFavorites.slice(0, visibleFavorites)}
                        keyExtractor={(i) => i.id}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <ItemCard item={item} onPress={() => router.push('/PlaceInfo')} />
                        )}
                        ListFooterComponent={() => <View style={{ height: 8 }} />}
                    />

                    <View style={styles.controlsRow}>
                        <TouchableOpacity
                            style={styles.expandBtn}
                            onPress={() => setVisibleFavorites(v => Math.max(3, v - 3))}
                            disabled={visibleFavorites <= 3}
                        >
                            <Text style={styles.expandBtnText}>-</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.expandBtn}
                            onPress={() => setVisibleFavorites(v => Math.min(sampleFavorites.length, v + 3))}
                            disabled={visibleFavorites >= sampleFavorites.length}
                        >
                            <Text style={styles.expandBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent</Text>
                    </View>

                    <FlatList
                        data={sampleRecent.slice(0, visibleRecent)}
                        keyExtractor={(i) => i.id}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <ItemCard item={item} onPress={() => router.push('/PlaceInfo')} />
                        )}
                        ListFooterComponent={() => <View style={{ height: 8 }} />}
                    />

                    <View style={styles.controlsRow}>
                        <TouchableOpacity
                            style={styles.expandBtn}
                            onPress={() => setVisibleRecent(v => Math.max(3, v - 3))}
                            disabled={visibleRecent <= 3}
                        >
                            <Text style={styles.expandBtnText}>-</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.expandBtn}
                            onPress={() => setVisibleRecent(v => Math.min(sampleRecent.length, v + 3))}
                            disabled={visibleRecent >= sampleRecent.length}
                        >
                            <Text style={styles.expandBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                </ScrollView>

            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: 'transparent', alignItems: 'stretch', justifyContent: 'flex-start', paddingBottom: 50 },
    card: { flex: 1, backgroundColor: '#f2f2f2', overflow: 'hidden'},
    header: { backgroundColor: '#e6e6e6', paddingVertical: 12, alignItems: 'center', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    headerText: { fontSize: 18, fontWeight: '600' },
    section: { paddingHorizontal: 12, paddingTop: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '600' },
    sectionAdd: { fontSize: 20, color: '#333' },
    expandControls: { flexDirection: 'row' },
    expandBtn: { width: 34, height: 28, borderRadius: 6, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ddd', marginHorizontal: 6 },
    controlsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, marginBottom: 12 },
    expandBtnText: { fontSize: 18, fontWeight: '700' },
    itemCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
    thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#e0e0e0', marginRight: 12 },
    itemText: { flex: 1 },
    itemTitle: { fontSize: 14, fontWeight: '700' },
    itemSubtitle: { fontSize: 12, color: '#777', marginTop: 4 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    itemSubtitleLeft: { fontSize: 12, color: '#777', flex: 1 },
    itemSubtitleRight: { fontSize: 12, color: '#777', flex: 1, textAlign: 'right' },
});

export default History;