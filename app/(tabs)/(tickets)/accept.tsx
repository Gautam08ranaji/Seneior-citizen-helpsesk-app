import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// Update the import path to match your project structure, for example:
import { useAppTheme } from '../../../theme/ThemeContext'; // 👈 import theme hook

export default function AcceptScreen() {
  const router = useRouter();
  const { theme } = useAppTheme(); // 👈 access current theme
  const colors = theme.colors;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Image
          source={require('../../../assets/images/avatar.png')}
          style={styles.image}
        />
        <Text style={[styles.title, { color: 'limegreen' }]}>
          Ticket Accepted
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          You have successfully accepted the ticket. You can now proceed to the site or perform the assigned task.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primaryColor }]}
        //   onPress={() => router.push('/(Tickets)')}
        >
          <Text style={[styles.buttonText, { color: colors.text || '#000' }]}>
            Back to Tickets
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    padding: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: 'bold',
  },
});