import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  // If i18n not yet initialized (language not loaded)
  if (!i18n.language) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#293160" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* App Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo.png")} // ✅ Replace with your logo path
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* App Title */}
      <Text style={styles.title}>{t("WelcomeScreen.title")}</Text>

      {/* Tagline (optional) */}
      <Text style={styles.tagline}>{t("WelcomeScreen.tagline")}</Text>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(auth)/languageSelection")} // ✅ Navigation enabled
      >
        <Text style={styles.buttonText}>{t("WelcomeScreen.button")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  logo: {
    width: 160,
    height: 160,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#293160",
    paddingVertical: 15,
    paddingHorizontal: 70,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
});
