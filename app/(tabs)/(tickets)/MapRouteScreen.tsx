import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocation } from '../../../hooks/LocationContext'; // ✅ Using global location

const { height } = Dimensions.get('window');

const destination = {
  latitude: 27.1751,
  longitude: 78.0421, // Taj Mahal
};

export default function MapRouteScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);

  const { location: currentLocation } = useLocation(); // ✅ Using location from context
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [region, setRegion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentLocation) return;

    setRegion({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });

    const fetchRoute = async () => {
      try {
        const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
        const dest = `${destination.latitude},${destination.longitude}`;
        const API_KEY = 'AIzaSyCs-N8XxSQWIfllyifIcpNLKANPTWnd2jk';

        const res = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&key=${API_KEY}`
        );
        const data = await res.json();

        if (data.routes?.length) {
          const points = decodePolyline(data.routes[0].overview_polyline.points);
          setRouteCoords(points);
        } else {
          Alert.alert('No route found');
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not fetch route.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [currentLocation]);

  const decodePolyline = (t: string): { latitude: number; longitude: number }[] => {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < t.length) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  };

  const openNativeNavigation = () => {
    const { latitude, longitude } = destination;
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${latitude},${longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

    Linking.openURL(url).catch(() => Alert.alert('Error', 'Failed to open navigation app'));
  };

  const zoomIn = () => {
    if (region) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta / 2,
        longitudeDelta: region.longitudeDelta / 2,
      };
      mapRef.current?.animateToRegion(newRegion, 300);
      setRegion(newRegion);
    }
  };

  const zoomOut = () => {
    if (region) {
      const newRegion = {
        ...region,
        latitudeDelta: region.latitudeDelta * 2,
        longitudeDelta: region.longitudeDelta * 2,
      };
      mapRef.current?.animateToRegion(newRegion, 300);
      setRegion(newRegion);
    }
  };

  if (loading || !currentLocation || !region) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primaryColor} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        showsUserLocation
        region={region}
        onRegionChangeComplete={(r) => setRegion(r)}
      >
        <Marker coordinate={currentLocation} title="Your Location" />
        <Marker coordinate={destination} title="Taj Mahal" pinColor="orange" />
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="orange" />
        )}
      </MapView>

      <View style={[styles.floatingButtonWrapper, { bottom: 60 + insets.bottom }]}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={openNativeNavigation}
          activeOpacity={0.85}
        >
          <MaterialIcons name="navigation" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.floatingButtonText}>Start Navigation</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.zoomControls}>
        <TouchableOpacity onPress={zoomIn} style={styles.zoomButton}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={zoomOut} style={styles.zoomButton}>
          <Text style={styles.zoomText}>−</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1000,
  },
  floatingButton: {
    backgroundColor: '#2787b0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  zoomControls: {
    position: 'absolute',
    right: 10,
    top: 100,
    zIndex: 999,
    gap: 12,
  },
  zoomButton: {
    width: 42,
    height: 42,
    backgroundColor: '#2787b0',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  zoomText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});