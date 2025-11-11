// LocationContext.tsx

import { RootState } from '@/redux/store';
import apiClient from '@/services/api/axiosInstance';
import * as Location from 'expo-location';
import qs from 'qs';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert, AppState, AppStateStatus, Platform } from 'react-native';
import { useSelector } from 'react-redux';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  location: LocationData | null;
  locationName: string | null;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  locationName: null,
  refreshLocation: () => {},
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const appActiveRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  const user = useSelector((state: RootState) => state.user);

  const sendLocationToBackend = async ({
    szAPIKey,
    szDeviceType,
    UserId,
    UserCurrentLocName,
    Latitude,
    Longitude,
    UserStatus,
  }: {
    szAPIKey: string;
    szDeviceType: string;
    UserId: number;
    UserCurrentLocName: string;
    Latitude: number;
    Longitude: number;
    UserStatus: string;
  }) => {
    try {
      const data = qs.stringify({
        szAPIKey,
        szDeviceType,
        UserId,
        UserCurrentLocName,
        Laltitue: Latitude, // Typo in API parameter name must be kept
        Longitute: Longitude,
        UserStatus,
      });

      const response = await apiClient.post(
        '/UpdateUserLocation',
        data,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log('✅ Location sent to backend:', response.data);
    } catch (error) {
      console.error('❌ Error sending location to backend:', error);
    }
  };

  // Safe reverse geocoding with timeout
  const reverseGeocodeWithTimeout = async (coords: LocationData, timeout = 8000) => {
    return Promise.race([
      Location.reverseGeocodeAsync(coords),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Reverse geocode timeout')), timeout)
      ),
    ]);
  };

  const fetchLocation = async () => {
    const now = Date.now();

    if (now - lastFetchTime < 30 * 1000) {
      console.log('⏱ Skipping location fetch: cooldown active');
      return;
    }

    if (isFetchingRef.current) {
      console.log('⏳ Already fetching location, skipping...');
      return;
    }

    isFetchingRef.current = true;
    setLastFetchTime(now);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this app.');
        return;
      }

      await Location.enableNetworkProviderAsync().catch(() => {});

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setLocation(coords);
      console.log('📍 Location:', coords);

      let trimmedName = 'Unknown';
      try {
        const address = await reverseGeocodeWithTimeout(coords, 8000);
        if (address.length > 0) {
          const place = address[0];
          trimmedName = `${place.name || ''}, ${place.city || place.subregion || place.region || ''}, ${place.country || ''}`.trim();
        }
      } catch (err) {
        console.warn('⚠️ Reverse geocode failed:', err);
      }
      setLocationName(trimmedName);
      console.log('📌 Location name:', trimmedName);

      // Send to backend if logged in
      if (user?.id && user?.token && user?.status) {
        await sendLocationToBackend({
          szAPIKey: user.token,
          szDeviceType: Platform.OS.toLowerCase(),
          UserId: user.id,
          UserCurrentLocName: trimmedName,
          Latitude: coords.latitude,
          Longitude: coords.longitude,
          UserStatus: user.status.toLowerCase(),
        });
      } else {
        console.log('⚠️ Skipping backend send: User not logged in');
      }
    } catch (error) {
      console.error('❌ Error fetching location:', error);
      Alert.alert(
        'Location Error',
        'Unable to fetch location. Please enable location services.'
      );
    } finally {
      isFetchingRef.current = false;
    }
  };

  // Handle app coming to foreground
  const handleAppStateChange = (state: AppStateStatus) => {
    if (state === 'active') {
      const now = Date.now();
      if (now - appActiveRef.current > 30 * 1000) {
        appActiveRef.current = now;
        if (user?.id && user?.token && user?.status) {
          fetchLocation();
        }
      } else {
        console.log('⏳ App resumed but skipping location fetch (cooldown)');
      }
    }
  };

  useEffect(() => {
    if (user?.id && user?.token && user?.status) {
      fetchLocation(); // Fetch once on login
    }

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [user?.id, user?.token, user?.status]);

  return (
    <LocationContext.Provider
      value={{
        location,
        locationName,
        refreshLocation: fetchLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
