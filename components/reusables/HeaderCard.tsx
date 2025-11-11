import { RootState } from "@/redux/store";
import { useAppTheme } from "@/theme/ThemeContext";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import Card from "./card";

const { width: screenWidth } = Dimensions.get("window");

type HeaderCardProps = {
  mobileNumber: string;
  vehicleNumber: string;
};

const statusOptions = ["Online", "Busy", "Offline"] as const;
type StatusType = typeof statusOptions[number];

const HeaderCard: React.FC<HeaderCardProps> = ({
  mobileNumber,
  vehicleNumber,
}) => {
  const [status, setStatus] = useState<StatusType>("Online");
  const [modalVisible, setModalVisible] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const { theme } = useAppTheme(); // ✅ Theme

  const getStatusColor = (s: StatusType) => {
    switch (s) {
      case "Online":
        return theme.status.success || "#35CB35";
      case "Busy":
        return theme.status.warning || "orange";
      case "Offline":
        return theme.status.error || "red";
    }
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.button.primary.bg }]}>
      <View style={styles.row}>
        {/* Profile Image */}
        <Image
          source={require("../../assets/images/avatar.png")}
          style={styles.profileImg}
          resizeMode="cover"
        />

        {/* Info Section (column) */}
        <View style={styles.column}>
          <Text style={[styles.mobileText, { color: theme.background.screen }]}>
            {mobileNumber}
          </Text>
          <Text style={[styles.vechileText, { color: theme.background.screen }]}>
            Vehicle No: {vehicleNumber}
          </Text>

          {/* Status below vehicle number */}
          <TouchableOpacity
            style={styles.statusContainer}
            onPress={() => setModalVisible(true)}
          >
            <View
              style={[styles.dot, { backgroundColor: getStatusColor(user.status) }]}
            />
            <Text
              style={[styles.statusText, { color: getStatusColor(user.status) }]}
            >
              {user.status}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal for selecting status */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.background.section }]}
          >
            {statusOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.option}
                onPress={() => {
                  setStatus(opt);
                  setModalVisible(false);
                }}
              >
                <View
                  style={[styles.dot, { backgroundColor: getStatusColor(opt) }]}
                />
                <Text style={[styles.optionText, { color: theme.text.primary }]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: screenWidth * 0.95,
    minHeight: 100,
    padding: 16,
    borderRadius: 15,
    justifyContent: "center",
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  column: {
    flexDirection: "column",
    flex: 1,
  },
  profileImg: {
    width: screenWidth * 0.15,
    height: screenWidth * 0.15,
    borderRadius: (screenWidth * 0.15) / 2,
    marginRight: 16,
  },
  mobileText: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 22,
    flexWrap: "wrap",
  },
  vechileText: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    flexWrap: "wrap",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 12,
    padding: 16,
    width: screenWidth * 0.6,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 16,
  },
});

export default HeaderCard;
