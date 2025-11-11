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
import { useAppTheme } from '../../../theme/ThemeContext'; // theme hook

export default function RejectScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const colors = theme.colors;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Image
          source={require('../../../assets/images/avatar.png')} // 🔄 optional: use a specific rejection image
          style={styles.image}
        />
        <Text style={[styles.title, { color: 'red' }]}>
          Ticket Rejected
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          You have rejected the ticket. If this was a mistake, please contact your supervisor or review your pending tickets.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primaryColor }]}
        //   onPress={() => router.push('/(tickets)')}
        >
          <Text style={[styles.buttonText, { color:  '#fff' }]}>
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
    resizeMode: 'contain',
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
    paddingHorizontal: 10,
  },
  button: {
    padding: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});