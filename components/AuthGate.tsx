import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import Loader from './reusables/loader';

type Props = {
  children: React.ReactNode;
};

export default function AuthGate({ children }: Props) {
  const router = useRouter();
  const segments = useSegments();
  const token = useSelector((state: RootState) => state.user.token);

  const [checkedAuth, setCheckedAuth] = useState(false);
  const [hasLaunchedBefore, setHasLaunchedBefore] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const launched = await AsyncStorage.getItem('hasLaunched');
      if (!launched) {
        await AsyncStorage.setItem('hasLaunched', 'true');
        setHasLaunchedBefore(false); // first launch
      } else {
        setHasLaunchedBefore(true);
      }
    };
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    if (hasLaunchedBefore === null) return; // still checking first launch

    const inAuthGroup = segments[0] === '(auth)';

    if (!token) {
      if (!inAuthGroup) {
        if (!hasLaunchedBefore) {
          // First launch: allow Welcome screen (usually '/')
          router.replace('/(auth)/welcome');
        } else {
          // After first launch: redirect to login
          router.replace('/(auth)/login');
        }
      }
    }

    setCheckedAuth(true);
  }, [token, segments, hasLaunchedBefore]);

  if (!checkedAuth || hasLaunchedBefore === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Loader visible/>
      </View>
    );
  }

  return <>{children}</>;
}
