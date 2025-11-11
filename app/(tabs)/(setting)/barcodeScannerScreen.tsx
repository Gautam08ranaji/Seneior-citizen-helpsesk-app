import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { CameraType, CameraView, FlashMode } from "expo-camera";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCameraPermission } from "../../../context/CameraPermissionProvider"; // custom hook

export default function BarcodeScannerScreen() {
  const { permissionGranted, requestPermission } = useCameraPermission();
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState<FlashMode>("off");
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const tabBarHeight = useBottomTabBarHeight();

  if (!permissionGranted) {
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
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={cameraType}
        flash={flash}
        onBarcodeScanned={scanned ? undefined : (data) => {
          setScanned(true);
          alert(`Scanned: ${data.data}`);
        }}
      />

      <View style={[styles.controls, { marginBottom: tabBarHeight + 15 }]}>
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

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setCameraType(cameraType === "back" ? "front" : "back")}
        >
          <Ionicons name="camera-reverse" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  button: { backgroundColor: "black", padding: 10, borderRadius: 5 },
  buttonText: { color: "white", fontWeight: "bold" },
  controls: { position: "absolute", bottom: 0, flexDirection: "row", gap: 15, width: "100%", justifyContent: "center" },
  iconButton: { backgroundColor: "rgba(0,0,0,0.6)", padding: 14, borderRadius: 50 },
});
