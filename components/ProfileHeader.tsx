import { setUserStatus } from '@/redux/slices/userSlice';
import { RootState } from '@/redux/store';
import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const statusColors = {
  Online: 'limegreen',
  Offline: 'gray',
  Busy: 'orange',
};

const statuses: ('Online' | 'Offline' | 'Busy')[] = ['Online', 'Offline', 'Busy'];

interface ProfileHeaderProps {
  editable?: boolean;
}

export default function ProfileHeader({ editable = false }: ProfileHeaderProps) {
  const user = useSelector((state: RootState) => state.user);
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.avatarWrapper}>
          <Image source={require('../assets/images/avatar.png')} style={styles.avatar} />
          <View style={[
            styles.statusIndicator,
            { backgroundColor: statusColors[user.status] || 'gray' }
          ]} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.vechile, { color: colors.text }]}>{user.VehicleNo}</Text>

          <TouchableOpacity
            style={styles.statusRow}
            disabled={!editable}
            onPress={() => editable && setModalVisible(true)}
          >
            <View
              style={[
                styles.onlineDot,
                { backgroundColor: statusColors[user.status] || 'gray' },
              ]}
            />
            <Text style={[styles.statusText, { color: statusColors[user.status] }]}>
              {user.status}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Change Modal */}
      {editable && (
        <Modal visible={modalVisible} transparent animationType="fade">
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalBackdrop}
            onPress={() => setModalVisible(false)}
          >
            <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => {
                    dispatch(setUserStatus(status));
                    setModalVisible(false);
                  }}
                  style={[
                    styles.modalItem,
                    {
                      backgroundColor:
                        user.status === status ? colors.primaryColor : 'transparent',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.onlineDot,
                      { backgroundColor: statusColors[status], marginRight: 10 },
                    ]}
                  />
                  <Text
                    style={{
                      color: user.status === status ? '#fff' : colors.text,
                      fontWeight: user.status === status ? 'bold' : 'normal',
                    }}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Platform.OS === 'ios' ? 20 : 16,
    borderBottomWidth: 1,
    paddingTop:0
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  vechile: {
    fontSize: 12,
    // fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    borderRadius: 12,
    padding: 12,
    minWidth: 180,
    elevation: 10,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
});
