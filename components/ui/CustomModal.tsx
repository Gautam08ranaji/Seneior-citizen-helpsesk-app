import { useAppTheme } from "@/theme/ThemeContext"; // ✅ import type
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height, width } = Dimensions.get("window");

type TabType = "notifications" | "announcements" | "search";

interface ModalItem {
  id: string;
  iconText?: string;
  message: string;
  subText?: string;
  actionText?: string;
  onPress?: () => void;
}

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  tabType?: TabType;
  notifications?: ModalItem[];
  announcements?: ModalItem[];
  searchResults?: ModalItem[];
}

const bgColors = ["#FFF5DD", "#FFDACF", "#C8FFC6"];
const textColors = ["#BE7A24", "#D83607", "#279357"];

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  tabType = "notifications",
  notifications = [],
  announcements = [],
  searchResults = [],
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(tabType);
  const [searchQuery, setSearchQuery] = useState("");

  const { theme } = useAppTheme(); // ✅ access theme
  const slideAnim = useRef(new Animated.Value(-height)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -height,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const renderNotificationItem = ({ item, index }: { item: ModalItem; index: number }) => {
    const bgColor = bgColors[index % bgColors.length];
    const textColor = textColors[index % textColors.length];

    return (
      <View style={[styles.itemContainer, { backgroundColor: theme.background.section }]}>
        <View style={styles.itemRow}>
          {item.iconText && (
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: bgColor, borderColor: textColor },
              ]}
            >
              <Text style={[styles.iconText, { color: textColor }]}>{item.iconText}</Text>
            </View>
          )}
          <View style={styles.messageContainer}>
            <Text style={[styles.message, { color: theme.text.primary }]}>
              {item.message}
            </Text>
            {item.actionText && (
              <TouchableOpacity onPress={item.onPress}>
                <Text style={[styles.actionText, { color: theme.primary.base }]}>
                  {item.actionText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderSearchItem = ({ item }: { item: ModalItem }) => (
    <TouchableOpacity
      style={[styles.searchItem, { backgroundColor: theme.background.card }]}
      onPress={item.onPress}
    >
      <View style={{ flex: 1, paddingHorizontal: width * 0.04 }}>
        <Text style={[styles.searchTitle, { color: theme.text.primary }]}>
          {item.message}
        </Text>
        {item.subText && (
          <Text style={[styles.searchSub, { color: theme.text.secondary }]}>
            {item.subText}
          </Text>
        )}
      </View>
      <Ionicons name="arrow-forward" size={18} color={theme.text.secondary} />
    </TouchableOpacity>
  );

  const getData = () => {
    if (activeTab === "notifications") return notifications;
    if (activeTab === "announcements") return announcements;
    if (activeTab === "search")
      return searchResults.filter((item) =>
        item.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return [];
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
              maxHeight: height * 0.85,
              backgroundColor: theme.background.screen, // ✅ only string color
            },
          ]}
        >
          <View style={[styles.header, { paddingHorizontal: width * 0.04 }]}>
            <TouchableOpacity onPress={onClose} style={{ zIndex: 1 }}>
              <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
              {activeTab === "search" ? "Search" : "Notifications"}
            </Text>
          </View>

          {activeTab === "search" ? (
            <>
              <Text style={[styles.subHeader, { color: theme.text.secondary }]}>
                Stay updated with the latest announcements and notifications.
              </Text>

              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text.label, marginHorizontal: width * 0.04 },
                ]}
              >
                Search Results
              </Text>
              <FlatList
                data={getData()}
                keyExtractor={(item) => item.id}
                renderItem={renderSearchItem}
                contentContainerStyle={{ paddingBottom: height * 0.03 }}
                ItemSeparatorComponent={() => (
                  <View
                    style={{ height: 1, backgroundColor: theme.background.input }}
                  />
                )}
                ListEmptyComponent={
                  <Text style={{ padding: 16, color: theme.text.secondary }}>
                    No results found
                  </Text>
                }
              />
            </>
          ) : (
            <>
              <Text style={[styles.subHeader, { color: theme.text.secondary }]}>
                Stay updated with the latest announcements and notifications.
              </Text>

              <View style={[styles.tabs, { borderBottomColor: theme.background.input }]}>
                <TouchableOpacity
                  onPress={() => setActiveTab("notifications")}
                  style={[
                    styles.tab,
                    activeTab === "notifications" && {
                      borderBottomColor: theme.primary.base,
                      borderBottomWidth: 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: theme.text.secondary },
                      activeTab === "notifications" && {
                        color: theme.primary.base,
                        fontWeight: "600",
                      },
                    ]}
                  >
                    Notifications
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab("announcements")}
                  style={[
                    styles.tab,
                    activeTab === "announcements" && {
                      borderBottomColor: theme.primary.base,
                      borderBottomWidth: 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: theme.text.secondary },
                      activeTab === "announcements" && {
                        color: theme.primary.base,
                        fontWeight: "600",
                      },
                    ]}
                  >
                    Announcements
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={getData()}
                keyExtractor={(item) => item.id}
                renderItem={renderNotificationItem}
                contentContainerStyle={{ paddingBottom: height * 0.03 }}
                ItemSeparatorComponent={() => (
                  <View
                    style={{ height: 1, backgroundColor: theme.background.input }}
                  />
                )}
              />
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
  },
  modalContainer: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  subHeader: {
    fontSize: 14,
    alignSelf: "center",
    marginVertical: 4,
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabText: {
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  searchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  searchTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  searchSub: {
    fontSize: 12,
    marginTop: 2,
  },
  itemContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    // marginVertical: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
  },
  iconText: {
    fontWeight: "bold",
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
  },
  actionText: {
    fontWeight: "500",
  },
});
