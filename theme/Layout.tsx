// theme/Layout.ts
import { StyleSheet } from 'react-native';

const layout = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  rowFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 40,
};

export default layout;
