import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const screenWidth = Dimensions.get("window").width;

type StatusCardProps = {
  title: string;
  count: number;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  // path: Href;
};

const StatusCard = React.memo(
  ({ title, count, color, icon,  }: StatusCardProps) => {
    const { colors } = useTheme();

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        // onPress={() => path && router.push(path)}
      >
        <View style={[styles.iconCircle, { backgroundColor: `${color}33` }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View>
          <Text style={[styles.cardCount, { color }]}>{count}</Text>
          <Text style={[styles.cardLabel, { color: `${colors.text}99` }]}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

export default StatusCard;

const styles = StyleSheet.create({
  card: {
    width: (screenWidth - 64) / 2, 
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cardCount: { fontSize: 20, fontWeight: "bold" },
  cardLabel: { fontSize: 13, textTransform: "uppercase", marginTop: 2 },
});
