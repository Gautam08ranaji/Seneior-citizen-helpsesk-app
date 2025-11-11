import ProfileHeader from '@/components/ProfileHeader';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../../../hooks/LocationContext';

export default function CloseTaskDetailsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { location: currentLocation } = useLocation();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();

  // Closed task example
  const closedTask = {
    category: 'Fiber Cut Resolved',
    owner: 'Ravi Kumar',
    assignee: 'Anjali Sharma',
    closedOn: '12 Jul 2025 14:30:00',
    resolutionSummary: 'Repaired broken fiber connection and restored service.',
    site: 'Sector 15 Noida, Near Metro Station',
    coordinates: {
      latitude: 28.5821,
      longitude: 77.3265,
    },
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ProfileHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Closed Task Info Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.label, { color: colors.text }]}>
              {t('CloseTaskDetailsScreen.category', 'Category')}
            </Text>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={20} color="green" />
              <Text style={styles.statusText}>Closed</Text>
            </View>
          </View>

          <Text style={[styles.value, { color: colors.text }]}>
            {closedTask.category}
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>
            {t('CloseTaskDetailsScreen.owner', 'Owner')}
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {closedTask.owner}
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>
            {t('CloseTaskDetailsScreen.assignee', 'Assignee')}
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {closedTask.assignee}
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>
            {t('CloseTaskDetailsScreen.closedOn', 'Closed On')}
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {closedTask.closedOn}
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>
            {t('CloseTaskDetailsScreen.resolutionSummary', 'Resolution Summary')}
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {closedTask.resolutionSummary}
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>
            {t('CloseTaskDetailsScreen.site', 'Site')}
          </Text>
          <Text style={styles.site}>{closedTask.site}</Text>
        </View>

        {/* Route Button */}
        <TouchableOpacity
          style={styles.routeButton}
          onPress={() =>
            router.push({
              pathname: '/MapRouteScreen',
              params: {
                lat: closedTask.coordinates.latitude.toString(),
                lng: closedTask.coordinates.longitude.toString(),
              },
            })
          }
        >
          <Text style={styles.routeText}>
            {t('CloseTaskDetailsScreen.findRoute', 'View Route')}
          </Text>
        </TouchableOpacity>

        {/* Map */}
        <MapView
          style={styles.map}
          provider="google"
          showsUserLocation={true}
          initialRegion={{
            latitude: currentLocation?.latitude ?? closedTask.coordinates.latitude,
            longitude: currentLocation?.longitude ?? closedTask.coordinates.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={closedTask.coordinates} title="Task Site" />
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="Your Location"
              pinColor="blue"
            />
          )}
        </MapView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, paddingBottom: 100 },
  card: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 6,
    color: 'green',
    fontWeight: 'bold',
  },
  label: { fontSize: 13, marginTop: 12 },
  value: { fontSize: 14 },
  site: {
    color: 'lightgreen',
    fontSize: 14,
    fontWeight: 'bold',
  },
  routeButton: {
    backgroundColor: '#6c5ce7',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  routeText: { color: '#fff', fontWeight: 'bold' },
  map: {
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
  },
});