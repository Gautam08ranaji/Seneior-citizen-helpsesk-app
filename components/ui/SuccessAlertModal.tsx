import React, { useEffect, useRef } from "react";
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

type SuccessAlertProps = {
  visible: boolean;
  title?: string;
  message: string;
  onHide: () => void;
  duration?: number; // auto-hide after ms
  type?: "success" | "error" | "info";
};

const SuccessAlert: React.FC<SuccessAlertProps> = ({
  visible,
  title = "Success",
  message,
  onHide,
  duration,
  type = "success",
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // auto hide only if duration is passed
      if (duration) {
        const timer = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => onHide());
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { width: width * 0.8, opacity: fadeAnim }]}>
          {/* Icon */}
          {type === "success" && <Text style={styles.icon}>✅</Text>}
          {type === "error" && <Text style={styles.icon}>❌</Text>}
          {type === "info" && <Text style={styles.icon}>ℹ️</Text>}

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* OK Button */}
          <TouchableOpacity style={styles.button} onPress={onHide}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default SuccessAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  icon: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  message: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#28a745", // green like in image
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
