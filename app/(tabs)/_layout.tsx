import NotificationBadge from '@/components/ui/NotificationIcon';
import { RootState } from '@/redux/store';
import { getUserListByReportTo } from '@/services/api/GetUserListByReportTo';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { useAppTheme } from '../../theme/ThemeContext';

export default function TabLayout() {
  const { theme, mode } = useAppTheme();
  const [userList, setUserList] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchUserList = async () => {
      setLoading(true);
      try {
        const response = await getUserListByReportTo({
          szAPIKey: user.token,
          szDeviceType: Platform.OS,
          UserId: user.id,
          AccountId: user.AccountId,
        });

        if (response.StatusCode === 200 && response.UserListByReportTo) {
          setUserList(response.UserListByReportTo.length);
        } else {
          console.log('API error:', response.StatusMessage);
        }
      } catch (error) {
        console.error('Fetch user list failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserList();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.button.primary.bg,
        tabBarInactiveTintColor: theme.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.background.screen,
          borderTopColor: theme.text.secondary,
          position: 'absolute',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ?  'home' : 'home-outline' }
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(tickets)"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ?'receipt': 'receipt-outline' }
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(expenses)"
        options={{
          title: 'Enrollment',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person-add':'person-add-outline' }
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(attendence)"
        options={{
          title: 'Attendence',
          tabBarIcon: ({ color, size, focused }) => (
            <NotificationBadge count={userList}>
              <Ionicons
                name={focused ? 'add-circle':'add-circle-outline' }
                size={size}
                color={color}
              />
            </NotificationBadge>
          ),
        }}
      />

      <Tabs.Screen
        name="(setting)"
        options={{
          title: 'Setting',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ?  'settings' :'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
