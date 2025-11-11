import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3, // for Android shadow
  },
});

export default Card;
