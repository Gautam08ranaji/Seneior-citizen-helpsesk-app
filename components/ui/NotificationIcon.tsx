import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  count?: number;
  children: React.ReactNode;
};
const NotificationBadge: React.FC<Props> = ({ count, children }) => {
  return (
    <View style={{ position: 'relative' }}>
      <View>
        {typeof children === 'string' ? <Text>{children}</Text> : children}
      </View>
      {count && count > 0 && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    right: -10,
    top: -7,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default NotificationBadge;
