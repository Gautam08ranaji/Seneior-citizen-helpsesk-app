import { useAppTheme } from "@/theme/ThemeContext"; // ✅ import theme hook
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "react-native-paper";

const { width, height } = Dimensions.get("window");

const tabs = ["Today", "Weekly", "Monthly"];

// 🔹 Utilities
const isToday = (date: Date) => {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

const isThisWeek = (date: Date) => {
  const now = new Date();
  const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
  const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6));
  return date >= firstDay && date <= lastDay;
};

const isThisMonth = (date: Date) => {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

// ✅ Main Component
export default function HandoverLogsScreen() {
  const { theme } = useAppTheme(); // ✅ use theme
  const tabBarHeight = useBottomTabBarHeight();
  const [activeTab, setActiveTab] = useState("Today");

  // 🔹 JSON logs data (inline on the same screen)
  const logs = [
    {
      category: "given",
      handoverImage: "handover-image-uri",
      person: "Durgesh Kumar Rai",
      date: "2025-10-26",
      tools: [
        {
          damagedQty: 0,
          goodQty: 5,
          id: "hm322",
          name: "12 inch Hammer",
          qty: 5,
        },
        {
          damagedQty: 0,
          goodQty: 2,
          id: "wr432",
          name: "Wrench 12 mm",
          qty: 2,
        },
      ],
    },
    {
      category: "received",
      handoverImage: "handover-image-uri-2",
      person: "Amit Sharma",
      date: "2025-10-25",
      tools: [
        {
          damagedQty: 1,
          goodQty: 4,
          id: "dr546",
          name: "Drill Machine",
          qty: 5,
        },
      ],
    },
  ];

  // 🔹 Filter logs by selected tab
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const date = new Date(log.date);
      if (activeTab === "Today") return isToday(date);
      if (activeTab === "Weekly") return isThisWeek(date);
      if (activeTab === "Monthly") return isThisMonth(date);
      return true;
    });
  }, [logs, activeTab]);

  // 🔹 Transform logs into SectionList format
  const sections = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredLogs.forEach((log) => {
      if (!groups[log.category]) groups[log.category] = [];
      log.tools.forEach((tool: any) =>
        groups[log.category].push({ ...log, tool })
      );
    });

    return Object.keys(groups).map((category) => ({
      title: category === "given" ? "Handover Given" : "Handover Received",
      data: groups[category],
    }));
  }, [filteredLogs]);

  // 🔹 Render Tool Card
  const renderToolCard = ({ item }: any) => (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.background.card,
          borderColor: theme.button.secondary.text,
        },
      ]}
    >
      {/* Header with ID */}
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="document-text-outline" size={14} color={theme.primary.base} />
          <Text style={[styles.ticketId, { color: theme.primary.base }]}>{item.tool.id}</Text>
        </View>
      </View>

      {/* Person */}
      <View style={styles.row}>
        <Ionicons name="person-outline" size={14} color={theme.primary.base} />
        <Text style={[styles.label, { color: theme.text.primary }]}> Person: </Text>
        <Text style={[styles.value, { color: theme.text.secondary }]}>{item.person}</Text>
      </View>

      {/* Tool */}
      <View style={styles.row}>
        <Ionicons name="construct-outline" size={14} color={theme.primary.base} />
        <Text style={[styles.label, { color: theme.text.primary }]}> Tool: </Text>
        <Text style={[styles.value, { color: theme.text.secondary }]}>{item.tool.name}</Text>
      </View>

      {/* Quantity */}
      <View style={styles.row}>
        <Ionicons name="cube-outline" size={14} color={theme.primary.base} />
        <Text style={[styles.label, { color: theme.text.primary }]}> Qty: </Text>
        <Text style={[styles.value, { color: theme.text.secondary }]}>
          Good {item.tool.goodQty} | Damaged {item.tool.damagedQty} / {item.tool.qty}
        </Text>
      </View>

      {/* Date */}
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={14} color={theme.primary.base} />
        <Text style={[styles.label, { color: theme.text.primary }]}> Date: </Text>
        <Text style={[styles.value, { color: theme.text.secondary }]}>{item.date}</Text>
      </View>

      {/* Handover Image */}
      {item.handoverImage && (
        <Image
          source={{
            uri: "https://jcblhandtools.com/wp-content/uploads/2024/12/Guide-to-Workshop-Hand-Tools-2.webp",
          }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
    </Card>
  );

  return (
    <View style={{ backgroundColor: theme.background.screen, flex: 1 }}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                {
                  color: theme.primary.base,
                  borderColor: theme.primary.base,
                  backgroundColor:
                    activeTab === tab ? theme.background.section : "transparent",
                },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SectionList */}
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.tool.id + index}
        renderItem={renderToolCard}
        renderSectionHeader={({ section: { title } }) => (
          <Text
            style={[
              styles.categoryTitle,
              { color: theme.primary.base },
            ]}
          >
            {title}
          </Text>
        )}
        ListEmptyComponent={
          <Text
            style={{
              color: theme.text.placeholder,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            No handover logs found
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 140 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: height * 0.025,
  },
  tabText: {
    paddingVertical: 3,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderRadius: 5,
    fontWeight: "500",
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    marginLeft: 5,
  },
  card: {
    padding: width * 0.04,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "center",
  },
  ticketId: {
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  value: {
    fontSize: 12,
    flexShrink: 1,
  },
  image: {
    width: "100%",
    height: width * 0.35,
    borderRadius: 8,
    marginTop: 8,
  },
});
