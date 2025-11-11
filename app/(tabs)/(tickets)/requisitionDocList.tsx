import ProfileHeader from '@/components/ProfileHeader';
import { RootState } from '@/redux/store';
import { getRelatedDocument } from '@/services/api/GetRelatedDocument';
import { getRequisitionDocList } from '@/services/api/GetRequisitionDocList';
import { useTheme } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');





export default function RequisitionDocListScreen() {
  const { rqfId  , item } = useLocalSearchParams();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const user = useSelector((state: RootState) => state.user);

  const parsedItem = useMemo(() => {
  try {
    return item ? JSON.parse(item as string) : null;
  } catch (error) {
    console.error('Failed to parse item:', error);
    return null;
  }
}, [item]);


console.log("parsedItem",parsedItem);

  useEffect(() => {
    fetchRequisitionDocList();
  }, []);

  console.log("rqfId", rqfId);

  const fetchRequisitionDocList = async () => {
    try {
      const data = await getRequisitionDocList({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        strUserId: Number(user.id),
        RequisitionId: String(rqfId), // Replace with dynamic value if needed
      });

      if (data?.GetRequisitionDocList) {
        setUploadedDocs(data.GetRequisitionDocList);
        console.log("Fetched Docs:", data.GetRequisitionDocList);
      }
    } catch (err) {
      console.error('API error:', err);
    }
  };

  const fetchRelatedDocument = async (DocId: number) => {
    console.log("docid", DocId);

    try {
      const result = await getRelatedDocument(
        user.token,
        Platform.OS,
        user.id,
        DocId
      );

      const base64Data = result?.RetrieveDocumentsbytes;
      const fileName = result?.DocName || 'document';
      const isPdf = fileName.toLowerCase().endsWith('.pdf');

      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setLocalUri(fileUri);
      setFileType(isPdf ? 'pdf' : 'image');
      setModalVisible(true);
    } catch (error) {
      console.log('Failed to fetch related document:', error);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    console.log("itemsaz",item),
    
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => fetchRelatedDocument(item.DocId)}
    >
      <Text style={[styles.title, { color: colors.text }]}>{item.DocName}</Text>
      <Text style={[styles.subtitle, { color: colors.primaryColor }]}>
        RFQ: {item.RFQNumber}
      </Text>
      <Text style={[styles.date, { color: colors.notification }]}>
        Uploaded: {item.DocUplaodDate}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <ProfileHeader />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={uploadedDocs}
          keyExtractor={(item) => item.DocId.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>
              No documents found.
            </Text>
          }
        />

        <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)} animationType="slide">
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {fileType === 'image' && localUri && (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: localUri }}
                  style={styles.simpleImage}
                  resizeMode="contain"
                />
              </View>
            )}

            {fileType === 'pdf' && localUri && (
              <WebView
                source={{ uri: `file://${localUri}` }}
                style={styles.webView}
                originWhitelist={['*']}
                useWebKit
              />
            )}
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
  },
  date: {
    marginTop: 4,
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 30,
  },
  closeText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  imageWrapper: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleImage: {
    width: width * 0.85,
    height: height * 0.75,
  },
  webView: {
    flex: 1,
    width: width,
  },
});