import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";

type Language = {
  code: string;
  label: string;
  nativeLabel: string;
};

const LANGUAGES: Language[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
  { code: "pn", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ" },
];

export default function LanguageSelection() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState(i18n.language || "en");
  const [loading, setLoading] = useState(false);

  const handleSelect = (code: string) => {
    setSelected(code);
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      await i18n.changeLanguage(selected);
      // i18n already saves language in AsyncStorage (from your config)
      router.replace("/(auth)/login"); // 🔹 Navigate to next screen
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t("LanguageScreen.title") || "Select Your Language"}</Text>
      <Text style={styles.subtitle}>
        {t("LanguageScreen.subtitle") || "Choose the language you’re comfortable with"}
      </Text>

      <FlatList
        data={LANGUAGES}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.langItem,
              selected === item.code && styles.langItemSelected,
            ]}
            onPress={() => handleSelect(item.code)}
          >
            <Text style={styles.langLabel}>{item.label}</Text>
            <Text style={styles.langNative}>{item.nativeLabel}</Text>
            {selected === item.code && (
              <Ionicons name="checkmark-circle" size={22} color="#293160" />
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        disabled={loading}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>
          {loading ? t("LanguageScreen.loading") || "Saving..." : t("LanguageScreen.continue") || "Save & Continue"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 25,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 30,
  },
  langItem: {
    backgroundColor: "#111",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  langItemSelected: {
    backgroundColor: "#1d2233",
    borderWidth: 1,
    borderColor: "#293160",
  },
  langLabel: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  langNative: {
    fontSize: 14,
    color: "#888",
    marginLeft: 10,
    flex: 1,
  },
  button: {
    backgroundColor: "#293160",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
});
