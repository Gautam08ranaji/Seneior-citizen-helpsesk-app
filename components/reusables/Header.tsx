import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppTheme } from "@/theme/ThemeContext";
import { CustomModal } from "../ui/CustomModal";

interface HeaderProps {
  isHome?: boolean;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ isHome = false, title }) => {
  const navigation = useNavigation();
  const [notificationVisible, setNotificationVisible] = useState(false);

  const { theme } = useAppTheme(); // ✅ Theme

  return (
    <View style={[styles.container, { backgroundColor: theme.button.primary.bg }]}>
      {isHome ? (
        // Home Screen → Logo
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      ) : (
        // Other Screens → Back Button + Title
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color={theme.white} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.white }]}>{title}</Text>
        </View>
      )}

      <CustomModal
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
        tabType="notifications"
        notifications={[
          { id: "1", iconText: "D", message: "Gautam Rana ad you a task.", actionText: "Tap to see", onPress: () => console.log("Task tapped") },
          { id: "2", iconText: "Y", message: "Your 2 of 6 documents are rejected by HR Team.", actionText: "Tap to see, why?" },
          { id: "3", iconText: "Y", message: "Your 2 of 6 documents are rejected by HR Team.", actionText: "Tap to see, why?" },
          { id: "4", iconText: "Y", message: "Your 2 of 6 documents are rejected by HR Team.", actionText: "Tap to see, why?" },
        ]}
        announcements={[
          { id: "1", iconText: "A", message: "Company Townhall scheduled on Friday." },
          { id: "2", iconText: "A", message: "Company Townhall scheduled on Friday." },
          { id: "3", iconText: "A", message: "Company Townhall scheduled on Friday." },
        ]}
      />

      {/* Right Icon (Notification) */}
      <TouchableOpacity 
        style={[styles.iconButton, { backgroundColor:theme.white }]}
        onPress={() => setNotificationVisible(true)}
      >
        <Ionicons name="notifications-outline" size={22}  color={theme.button.primary.bg} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    width: 120,
    height: 40,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
  },
});

export default Header;
