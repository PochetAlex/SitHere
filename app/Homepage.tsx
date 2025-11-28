import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';


export default function Homepage() {
    const router = useRouter();
  // responsive sizing: compute sizes/offsets from screen dimensions
  const { width, height } = useWindowDimensions();
  const SEARCH_HEIGHT = Math.round(height * 0.06); // ~6% of screen height
  const BANNER_HEIGHT = Math.round(height * 0.07); // bandeau en haut ~7% of height
  const STATUS_BAR_HEIGHT = Platform.OS === 'android'
          ? StatusBar.currentHeight ?? Math.round(height * 0.03)
          : Math.round(height * 0.045);
  const BANNER_TOTAL_HEIGHT = BANNER_HEIGHT + STATUS_BAR_HEIGHT;
  const TOP_PADDING = Math.round(height * 0.03); // overlay paddingTop ~3%
  const SEARCH_MARGIN_TOP = Platform.OS === 'ios' ? Math.round(height * 0.008) : Math.round(height * 0.01);
  const TOP_BUTTONS_TOP = TOP_PADDING + BANNER_TOTAL_HEIGHT + SEARCH_MARGIN_TOP + SEARCH_HEIGHT + Math.round(height * 0.02); // space below banner + search
  const BOTTOM_BUTTON_BOTTOM = Math.round(height * 0.06); // bottom offset ~6%
  const HORIZONTAL_MARGIN = Math.round(width * 0.04); // left/right margin ~4%
  const BUTTON_SIZE = Math.round(Math.min(width, height) * 0.18); // button size ~18% of smaller screen dim
  const BUTTON_TEXT_SIZE = Math.round(BUTTON_SIZE * 0.18);
  const DEFAULT_ZOOM = 18;
  const [showPanel, setShowPanel] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permission to access location was denied');
          return;
        }

        // Try to get a fast, non-blocking last-known position so the UI can show immediately
        try {
          const last = await Location.getLastKnownPositionAsync();
          if (mounted && last && last.coords) {
            setUserLocation({ latitude: last.coords.latitude, longitude: last.coords.longitude });
            // animate to last-known quickly
              if (mapRef.current) {
              mapRef.current.animateCamera({ center: { latitude: last.coords.latitude, longitude: last.coords.longitude }, zoom: DEFAULT_ZOOM, heading: 0, pitch: 0 }, { duration: 300 });
            }
          }
        } catch (lkErr) {
          // ignore last-known errors
          console.warn('getLastKnownPositionAsync error', lkErr);
        }

        // Start the watcher (this resolves quickly and updates as fixes arrive)
        try {
          const posSub = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.Balanced, timeInterval: 2000, distanceInterval: 2 },
            (p) => {
              if (!mounted || !p) return;
              setUserLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude });
              // animate on the first accurate fix to improve UX
              if (mapRef.current) {
                mapRef.current.animateCamera({ center: { latitude: p.coords.latitude, longitude: p.coords.longitude }, zoom: DEFAULT_ZOOM, heading: 0, pitch: 0 }, { duration: 400 });
              }
            }
          );

          const cleanup = () => {
            try { posSub.remove(); } catch (e) { /* ignore */ }
          };

          (global as any).__expo_location_cleanup = cleanup;
        } catch (watchErr) {
          console.warn('Error starting location watcher', watchErr);
        }

        // Kick off a background precise location request but don't await it — it can be slow on cold start
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          .then((loc) => {
            if (!mounted || !loc) return;
            setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            if (mapRef.current) {
              mapRef.current.animateCamera({ center: { latitude: loc.coords.latitude, longitude: loc.coords.longitude }, zoom: DEFAULT_ZOOM, heading: 0, pitch: 0 }, { duration: 500 });
            }
          })
          .catch((err) => {
            // don't block UI; just log
            console.warn('Background getCurrentPositionAsync failed', err);
          });

      } catch (e) {
        console.warn('Error getting location', e);
      }
    })();

    return () => {
      mounted = false;
      try {
        const cleanup = (global as any).__expo_location_cleanup;
        if (typeof cleanup === 'function') cleanup();
        delete (global as any).__expo_location_cleanup;
      } catch (e) {
        // ignore
      }
    };
  }, []);

  

  const centerOnUser = async () => {
    try {
        if (!userLocation) {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setUserLocation(coords);
        if (mapRef.current) {
          mapRef.current.animateCamera({ center: coords, zoom: DEFAULT_ZOOM, heading: 0, pitch: 0 }, { duration: 500 });
        }
        return;
      }
      if (mapRef.current) {
        mapRef.current.animateCamera({ center: { latitude: userLocation.latitude, longitude: userLocation.longitude }, zoom: DEFAULT_ZOOM, heading: 0, pitch: 0 }, { duration: 500 });
      }
    } catch (e) {
      console.warn('Error centering on user', e);
    }
  };
  return (
    <View style={styles.container}>
      {/* Map en fond */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
    initialCamera={{
      center: { latitude: userLocation ? userLocation.latitude : 50.6330, longitude: userLocation ? userLocation.longitude : 3.0630 },
      zoom: DEFAULT_ZOOM,
      heading: 0,
      pitch: 0,
    }}
        onPress={(e) => {
          try {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setSelectedLocation({ latitude, longitude });
          } catch (err) {
            console.warn('Map onPress event parse error', err);
          }
        }}
        style={StyleSheet.absoluteFill} // full screen absolute
        // désactive les interactions si vous voulez que la carte soit purement décorative
        // pointerEvents="none" // ==> permet d'interagir avec l'UI au-dessus
      >
        {selectedLocation && (
          <Marker coordinate={selectedLocation} />
        )}

        {userLocation && (
          <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={true}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View style={styles.userDotSimple} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Contenu au-dessus de la map */}
      <View style={styles.overlay}>
        {/* Bandeau en haut */}
        <View style={[styles.topBanner, { height: BANNER_TOTAL_HEIGHT, paddingTop: STATUS_BAR_HEIGHT }]}> 
          <Text style={styles.topBannerText}>Accueil</Text>
        </View>

        {/* Search / placeholder en haut */}
        <View style={[styles.searchContainer, { marginTop: BANNER_TOTAL_HEIGHT + SEARCH_MARGIN_TOP }]}>
          <TextInput
            style={[styles.searchInput, { height: SEARCH_HEIGHT }]}
            placeholder="Rechercher un lieu"
            placeholderTextColor="#333"
            returnKeyType="search"
            // clearButtonMode et underlineColorAndroid pour meilleure UX
            clearButtonMode="while-editing"
            underlineColorAndroid="transparent"
          />
        </View>

        {/* Boutons placés dans chaque coin */}
        <TouchableOpacity
          style={[
            styles.cornerButton,
            { top: TOP_BUTTONS_TOP, left: HORIZONTAL_MARGIN, width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2 },
          ]}
          onPress={centerOnUser}
        >
          <Text style={[styles.buttonText, { fontSize: BUTTON_TEXT_SIZE }]}>Me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cornerButton,
            { top: TOP_BUTTONS_TOP, right: HORIZONTAL_MARGIN, width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2 },
          ]}
          onPress={() => router.push('/History')}
        >
          <Text style={[styles.buttonText, { fontSize: BUTTON_TEXT_SIZE }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cornerButton,
            { bottom: BOTTOM_BUTTON_BOTTOM, left: HORIZONTAL_MARGIN, width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2 },
          ]}
          onPress={() => router.push('/Settings')}
        >
          <Text style={[styles.buttonText, { fontSize: BUTTON_TEXT_SIZE }]}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cornerButton,
            { bottom: BOTTOM_BUTTON_BOTTOM, right: HORIZONTAL_MARGIN, width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2 },
          ]}
          onPress={() => {
            if (selectedLocation) {
              // pass coordinates as query params so AddPlace can prefill
              router.push(`/AddPlace?lat=${selectedLocation.latitude}&lng=${selectedLocation.longitude}`);
            } else {
              router.push('/AddPlace');
            }
          }}
        >
          <Text style={[styles.buttonText, { fontSize: BUTTON_TEXT_SIZE }]}>Add</Text>
        </TouchableOpacity>

        {/* Center button to open mini info panel */}
        <View style={styles.centerButtonWrap} pointerEvents="box-none">
          <TouchableOpacity style={styles.centerButton} onPress={() => setShowPanel(true)}>
            <Text style={styles.centerButtonText}>Ouvrir info</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom half panel with mini map + details (same info as PlaceInfo) */}
        {showPanel && (
          <View style={styles.panel}>
            <View style={styles.panelHandle}>
              <TouchableOpacity onPress={() => setShowPanel(false)} style={styles.panelClose}>
                <Text style={styles.panelCloseText}>Fermer</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.panelMap}>
              <MapView
                provider={PROVIDER_GOOGLE}
                initialCamera={{ center: { latitude: userLocation ? userLocation.latitude : 50.6330, longitude: userLocation ? userLocation.longitude : 3.0630 }, zoom: DEFAULT_ZOOM, heading: 0, pitch: 0 }}
                style={{ flex: 1, borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: 'hidden' }}
              />
            </View>
            <View style={styles.panelContent}>
              <Text style={styles.panelTitle}>Nom du lieu</Text>
              <Text style={styles.panelValue}>Place Example</Text>

              <Text style={[styles.panelLabel, { marginTop: 8 }]}>Number of seats</Text>
              <Text style={styles.panelValue}>4</Text>

              <Text style={[styles.panelLabel, { marginTop: 8 }]}>Covered?</Text>
              <Text style={styles.panelValue}>Yes</Text>

              <Text style={[styles.panelLabel, { marginTop: 8 }]}>Type</Text>
              <Text style={styles.panelValue}>Bench</Text>

              <Text style={[styles.panelLabel, { marginTop: 8 }]}>Rating</Text>
              <Text style={styles.panelValue}>4.5</Text>

              <Text style={[styles.panelLabel, { marginTop: 8 }]}>Description</Text>
              <Text style={[styles.panelValue, { marginBottom: 8 }]}>Nice spot near the station</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flex: 1,
    // position relative pour pouvoir placer des éléments absolus à l'intérieur
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 24,
  },
  searchContainer: {
    width: '100%',
    alignItems: 'center',
    // garder en haut avec un petit padding
    paddingHorizontal: 16,
    marginTop: Platform.OS === 'ios' ? 6 : 10,
  },

  topBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  topBannerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  searchInput: {
    width: '100%',
    maxWidth: 960,
    backgroundColor: 'rgba(255,255,255,0.85)',
    // presque toute la largeur — ici 100% moins paddingHorizontal
    height: 64,
    borderRadius: 12,
    paddingHorizontal: 14,
    // ombre légère (iOS) / elevation (Android)

  },
  centerContent: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  cornerButton: {
    position: 'absolute',
    // taille doublée
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  // corner positions are applied inline so they adapt to the computed offsets
  topLeft: {},
  topRight: {},
  bottomLeft: {},
  bottomRight: {},
  buttonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '700',
  },
  title: { fontSize: 20, fontWeight: '600', color: '#fff' },
  centerButtonWrap: { position: 'absolute', left: 0, right: 0, top: '45%', alignItems: 'center' },
  centerButton: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 24, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6 },
  centerButtonText: { fontWeight: '700', color: '#000' },
  panel: { position: 'absolute', left: 12, right: 12, bottom: 12, height: '50%', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  panelHandle: { padding: 8, alignItems: 'flex-end', backgroundColor: 'transparent' },
  panelClose: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#eee', borderRadius: 8 },
  panelCloseText: { color: '#333', fontWeight: '700' },
  panelMap: { height: '48%', backgroundColor: '#ddd' },
  panelContent: { padding: 12 },
  panelTitle: { fontSize: 14, fontWeight: '700' },
  panelLabel: { fontSize: 12, color: '#666' },
  panelValue: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  // small arrow showing device orientation (triangle) and a dot under it
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#007AFF',
    marginBottom: -2,
  },
  userDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginTop: -4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  arrowTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#007AFF',
    marginBottom: 0,
  },
  arrowShaft: {
    width: 4,
    height: 26,
    backgroundColor: '#007AFF',
    borderRadius: 2,
    marginTop: -2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  userDotSimple: {
    width: 14,
    height: 14,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
});