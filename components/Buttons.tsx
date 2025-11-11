import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle
} from 'react-native';

import colors from '../theme/Colors';

type DimensionValue = number | `${number}%` | 'auto';

interface CustomButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: 'primaryColor' | 'white' | 'red';
  width?: DimensionValue;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  size?: 'default' | 'small';
  onPress: () => void;
}

export default function CustomButton({
  title,
  variant = 'primaryColor',
  width,
  backgroundColor,
  onPress,
  style,
  size = 'default',
  ...props
}: CustomButtonProps) {
  const buttonStyle: StyleProp<ViewStyle> = [
    styles.button,
    { backgroundColor: backgroundColor || getVariantColor(variant) },
    size === 'small' && styles.smallButton,
    width !== undefined ? { width } : {},
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'primaryColor'
      ? styles.primaryColorText
      : variant === 'white'
        ? styles.whiteText
        : styles.redText,
    size === 'small' && styles.smallText,
  ];

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} {...props}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

function getVariantColor(variant: 'primaryColor' | 'white' | 'red') {
  switch (variant) {
    case 'primaryColor':
      return colors.primaryColor;
    case 'white':
      return colors.white;
    case 'red':
      return colors.mutedred;
    default:
      return colors.primaryColor;
  }
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButton: {
    padding: 8,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    fontFamily: 'BarlowBold',
  },
  primaryColorText: {
    color: colors.white,
  },
  whiteText: {
    color: colors.primaryColorLight,
  },
  redText: {
    color: colors.error,
  },
  smallText: {
    fontSize: 15,
    fontWeight: 'normal',
  },
});
