import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

const sampleRanking = [
    { id: 'g1', rank: 1, title: 'User A', score: 123 },
    { id: 'g2', rank: 2, title: 'User B', score: 110 },
    { id: 'g3', rank: 3, title: 'User C', score: 98 },
    { id: 'g4', rank: 4, title: 'User D', score: 90 },
    { id: 'g5', rank: 5, title: 'User E', score: 85 },
    { id: 'g6', rank: 6, title: 'User F', score: 80 },
];

const sampleAchievements = [
    { id: 'a1', title: 'First Visit', subtitle: 'Visited one place' },
    { id: 'a2', title: 'Explorer', subtitle: 'Visited 10 places' },
    { id: 'a3', title: 'Photographer', subtitle: 'Uploaded 5 photos' },
    { id: 'a4', title: 'Local Hero', subtitle: '5+ favorites' },
];

const sampleTopVisited = [
    { id: 't1', title: 'Central Park', visits: 42 },
    { id: 't2', title: 'City Square', visits: 31 },
    { id: 't3', title: 'Riverside', visits: 27 },
    { id: 't4', title: 'Old Town', visits: 20 },
];

const ItemCard = ({ title, subtitle, left }: { title: string; subtitle?: string; left?: string | number }) => (
    <View style={styles.itemCard}>
        <View style={styles.thumb} />
        <View style={styles.itemText}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.itemTitle}>{title}</Text>
                {left !== undefined ? <Text style={styles.itemSmallLeft}>{String(left)}</Text> : null}
            </View>
            {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
        </View>
    </View>
);

const Score = () => {
    const router = useRouter();
    const { height } = useWindowDimensions();
    const STATUS_BAR_HEIGHT = Platform.OS === 'android'
        ? StatusBar.currentHeight ?? Math.round(height * 0.03)
        : Math.round(height * 0.045);

    const [visibleRanking, setVisibleRanking] = useState(Math.min(3, sampleRanking.length));
    const [visibleAchievements, setVisibleAchievements] = useState(Math.min(3, sampleAchievements.length));
    const [visibleTopVisited, setVisibleTopVisited] = useState(Math.min(3, sampleTopVisited.length));

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.card}>
                <View style={[styles.header, { paddingTop: STATUS_BAR_HEIGHT, backgroundColor: '#000' }]}>
                    <Text style={[styles.headerText, { color: '#fff' }]}>Score</Text>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 24 }} style={{ flex: 1 }}>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Global Ranking</Text>
                        </View>

                        <FlatList
                            data={sampleRanking.slice(0, visibleRanking)}
                            keyExtractor={(i) => i.id}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <ItemCard title={item.title} subtitle={`Score: ${item.score}`} left={item.rank} />
                            )}
                            ListFooterComponent={() => <View style={{ height: 8 }} />}
                        />

                        <View style={styles.controlsRow}>
                            <TouchableOpacity
                                style={styles.expandBtn}
                                onPress={() => setVisibleRanking(v => Math.max(3, v - 3))}
                                disabled={visibleRanking <= 3}
                            >
                                <Text style={styles.expandBtnText}>-</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.expandBtn}
                                onPress={() => setVisibleRanking(v => Math.min(sampleRanking.length, v + 3))}
                                disabled={visibleRanking >= sampleRanking.length}
                            >
                                <Text style={styles.expandBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Achievements</Text>
                        </View>

                        <FlatList
                            data={sampleAchievements.slice(0, visibleAchievements)}
                            keyExtractor={(i) => i.id}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <ItemCard title={item.title} subtitle={item.subtitle} />
                            )}
                            ListFooterComponent={() => <View style={{ height: 8 }} />}
                        />

                        <View style={styles.controlsRow}>
                            <TouchableOpacity
                                style={styles.expandBtn}
                                onPress={() => setVisibleAchievements(v => Math.max(3, v - 3))}
                                disabled={visibleAchievements <= 3}
                            >
                                <Text style={styles.expandBtnText}>-</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.expandBtn}
                                onPress={() => setVisibleAchievements(v => Math.min(sampleAchievements.length, v + 3))}
                                disabled={visibleAchievements >= sampleAchievements.length}
                            >
                                <Text style={styles.expandBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Top Visited Places</Text>
                        </View>

                        <FlatList
                            data={sampleTopVisited.slice(0, visibleTopVisited)}
                            keyExtractor={(i) => i.id}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <ItemCard title={item.title} subtitle={`Visits: ${item.visits}`} />
                            )}
                            ListFooterComponent={() => <View style={{ height: 8 }} />}
                        />

                        <View style={styles.controlsRow}>
                            <TouchableOpacity
                                style={styles.expandBtn}
                                onPress={() => setVisibleTopVisited(v => Math.max(3, v - 3))}
                                disabled={visibleTopVisited <= 3}
                            >
                                <Text style={styles.expandBtnText}>-</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.expandBtn}
                                onPress={() => setVisibleTopVisited(v => Math.min(sampleTopVisited.length, v + 3))}
                                disabled={visibleTopVisited >= sampleTopVisited.length}
                            >
                                <Text style={styles.expandBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: 'transparent', alignItems: 'stretch', justifyContent: 'flex-start', paddingBottom: 50 },
    card: { flex: 1, backgroundColor: '#f2f2f2', overflow: 'hidden'},
    header: { backgroundColor: '#e6e6e6', paddingVertical: 12, alignItems: 'center', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
    headerText: { fontSize: 18, fontWeight: '600' },
    section: { paddingHorizontal: 12, paddingTop: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '600' },
    expandControls: { flexDirection: 'row' },
    expandBtn: { width: 34, height: 28, borderRadius: 6, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ddd', marginHorizontal: 6 },
    controlsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, marginBottom: 12 },
    expandBtnText: { fontSize: 18, fontWeight: '700' },
    itemCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
    thumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#e0e0e0', marginRight: 12 },
    itemText: { flex: 1 },
    itemTitle: { fontSize: 14, fontWeight: '700' },
    itemSmallLeft: { fontSize: 14, fontWeight: '700', color: '#777' },
    itemSubtitle: { fontSize: 12, color: '#777', marginTop: 4 },
});

export default Score;