import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

type Option = {
  text: string;
  onPress: () => void;
  type?: "default" | "destructive" | "cancel";
};

type CustomAlertModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  options: Option[];
};

const PRIMARY_COLOR = "#293160";

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  onClose,
  title,
  message,
  options,
}) => {
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 360;

  // cancel always first
  const sortedOptions = [...options].sort((a, b) => {
    if (a.type === "cancel") return 1;
    if (b.type === "cancel") return -1;
    return 0;
  });

  const isThreeOptions = sortedOptions.length === 3;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { width: width * 0.85, padding: isSmallDevice ? 15 : 20 },
          ]}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Text
              style={[
                styles.title,
                { fontSize: isSmallDevice ? 18 : 20 },
              ]}
            >
              {title}
            </Text>
            {message ? (
              <Text
                style={[
                  styles.message,
                  { fontSize: isSmallDevice ? 14 : 16 },
                ]}
              >
                {message}
              </Text>
            ) : null}

            <View
              style={[
                styles.buttonWrapper,
                isThreeOptions ? styles.column : styles.row,
              ]}
            >
              {sortedOptions.map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.button,
                    opt.type === "destructive" && styles.destructive,
                    opt.type === "cancel" && [styles.cancel, { marginTop: 25}],

                    isThreeOptions && styles.fullWidthButton,
                    { paddingVertical: isSmallDevice ? 10 : 12 },
                  ]}
                  onPress={() => {
                    opt.onPress();
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { fontSize: isSmallDevice ? 14 : 16 },
                      opt.type === "destructive" && styles.destructiveText,
                      opt.type === "cancel" && styles.cancelText,
                    ]}
                  >
                    {opt.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlertModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    maxHeight: "80%", // so it doesn’t overflow on small screens
    elevation: 5,
  },
  title: {
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    color: "#444",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonWrapper: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  column: {
    flexDirection: "column",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: PRIMARY_COLOR,
    alignItems: "center",
  },
  fullWidthButton: {
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  destructive: {
    backgroundColor: "#ff4d4d",
  },
  destructiveText: {
    color: "#fff",
  },
  cancel: {
    backgroundColor: "#ddd",
  },
  cancelText: {
    color: PRIMARY_COLOR,
    fontWeight: "600",
  },
});
