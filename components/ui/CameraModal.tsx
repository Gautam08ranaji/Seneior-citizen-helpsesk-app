import Loader from "@/components/reusables/loader";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, FlashMode, useCameraPermissions } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

interface SecureCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photoUri: string) => void;
}

export default function SecureCameraModal({
  visible,
  onClose,
  onCapture,
}: SecureCameraModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<FlashMode>("off");
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("Position your face in view");
  const cameraRef = useRef<CameraView | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [retry, setRetry] = useState(false);

  // ✅ Reset modal state when opened/closed
  useEffect(() => {
    if (visible) {
      setIsLoading(false);
      setStatusText("Position your face in view");
      setFaceDetected(false);
      setCapturedPhoto(null);
      setRetry(false);
    }
  }, [visible]);

  // ✅ Auto start scanning when modal becomes visible
  useEffect(() => {
    if (visible && permission?.granted) {
      const timer = setTimeout(() => handleScanFace(), 1200);
      return () => clearTimeout(timer);
    }
  }, [visible, permission]);

  const handleScanFace = async () => {
    if (!cameraRef.current) return;
    setIsLoading(true);
    setRetry(false);
    setStatusText("🔍 Scanning face...");

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      if (!photo?.uri) throw new Error("No photo captured");

      const result = await FaceDetector.detectFacesAsync(photo.uri, {
        mode: FaceDetector.FaceDetectorMode.accurate,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
        runClassifications: FaceDetector.FaceDetectorClassifications.all,
      });

      if (result.faces.length === 0) {
        setFaceDetected(false);
        setStatusText("❌ No face detected. Please try again.");
        Vibration.vibrate(400);
        setRetry(true);
        setIsLoading(false);
        return;
      }

      setFaceDetected(true);
      setCapturedPhoto(photo.uri);
      setStatusText("✅ Face detected successfully!");
      Vibration.vibrate(200);

      // ✅ Send to parent after short delay
      setTimeout(() => {
        onCapture(photo.uri);
        setIsLoading(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Face detection error:", error);
      setStatusText("⚠️ Error detecting face");
      setRetry(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.centered}>
        <Text>No access to camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Loader visible={isLoading} />

        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="front"
          flash={flash}
        />

        <View style={styles.overlay}>
          <Text style={styles.statusText}>{statusText}</Text>

          {retry && (
            <TouchableOpacity
              onPress={handleScanFace}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Retry</Text>
            </TouchableOpacity>
          )}

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setFlash(flash === "off" ? "on" : "off")}
            >
              <Ionicons
                name={flash === "off" ? "flash-off" : "flash"}
                size={28}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: { backgroundColor: "black", padding: 10, borderRadius: 5 },
  buttonText: { color: "white", fontWeight: "bold" },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 80,
  },
  controls: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    gap: 15,
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 14,
    borderRadius: 50,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  actionButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  statusText: {
    color: "white",
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
});
