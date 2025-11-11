import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

type LoaderProps = {
  visible: boolean;
  size?: number;
  source?: any;
};

const { width, height } = Dimensions.get("window");

const Loader: React.FC<LoaderProps> = ({
  visible,
  size = 120,
  source = require("../../assets/images/Loading.gif"),
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <Image
        source={source}
        style={[styles.gif, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999, // for Android
  },
  gif: {},
});

export default Loader;
