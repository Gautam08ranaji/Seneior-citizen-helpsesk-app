import ProfileHeader from '@/components/ProfileHeader';
import { RootState } from '@/redux/store';
import { getRelatedDocument } from '@/services/api/GetRelatedDocument';
import { getRequisitionDocList } from '@/services/api/GetRequisitionDocList';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Helper function to check if base64 is PDF
const isBase64Pdf = (base64: string): boolean => {
  return base64.startsWith('JVBER');
};

export default function RequisitionDocListScreen() {
  const { rqfId, item } = useLocalSearchParams();
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

  useEffect(() => {
    fetchRequisitionDocList();
  }, []);

  const fetchRequisitionDocList = async () => {
    try {
      const data = await getRequisitionDocList({
        szAPIKey: user.token,
        szDeviceType: Platform.OS,
        strUserId: Number(user.id),
        RequisitionId: String(rqfId),
      });

      if (data?.GetRequisitionDocList) {
        setUploadedDocs(data.GetRequisitionDocList);
      }
    } catch (err) {
      console.error('API error:', err);
    }
  };

  const fetchRelatedDocument = async (DocId: number) => {
    console.log("Docid", DocId);

    try {
      const result = await getRelatedDocument(
        user.token,
        Platform.OS,
        user.id,
        DocId
      );

      const base64Data = result?.RetrieveDocumentsbytes;
      const fileName = result?.DocName || 'document';
      // console.log("base64Data",base64Data);

      // Determine file type by inspecting base64
      const isPdf = isBase64Pdf(base64Data);
      const fileExtension = isPdf ? '.pdf' : '.jpg';

      console.log("fileExtension", fileExtension);

      const openPdfInBrowser = (base64: string) => {
        const pdfDataUrl = `data:application/pdf;base64,${base64}`;
        Linking.openURL(pdfDataUrl);
      };
      if (fileExtension === '.pdf') {
        openPdfInBrowser(base64Data)
      } else {
        const fileUri = `${FileSystem.cacheDirectory}${fileName}${fileExtension}`;

        console.log("fileUri", fileUri);
        console.log("fileName", fileName);


        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        setLocalUri(fileUri);
        setFileType(isPdf ? 'pdf' : 'image');
        setModalVisible(true);

      }


    } catch (error) {
      console.log('Failed to fetch related document:', error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isPdf = item.DocName.toLowerCase().endsWith('.pdf');

    return (
      <TouchableOpacity
        style={[styles.docCard, { backgroundColor: colors.card }]}
        onPress={() => fetchRelatedDocument(item.DocId)}
        activeOpacity={0.85}
      >
        <View style={styles.iconWrapper}>
          <Ionicons
            name={isPdf ? 'document-text-outline' : 'image-outline'}
            size={30}
            color={isPdf ? '#E74C3C' : '#3498DB'}
          />
        </View>

        <View style={styles.docDetails}>
          <Text style={[styles.docTitle, { color: colors.text }]} numberOfLines={1}>
            {item.DocName}
          </Text>
          <Text style={[styles.docDate, { color: colors.text }]}>
            Uploaded: {formatDate(item.DocUplaodDate)}
          </Text>
        </View>

        <View style={styles.docTypeBadge}>
          <Text style={styles.docTypeText}>{isPdf ? 'PDF' : 'IMAGE'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <ProfileHeader />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {parsedItem && (
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.infoTitle, { color: colors.primaryColor }]}>
                {parsedItem.RQFNo}
              </Text>
              <View style={styles.statusWrapper}>
                <View style={[styles.dot, { backgroundColor: colors.primaryColor }]} />
                <Text style={[styles.statusText, { color: colors.primaryColor }]}>
                  {parsedItem.Status}
                </Text>
              </View>
            </View>

            <Text style={[styles.infoRow, { color: colors.text }]}>
              <Text style={styles.label}>Owner: </Text>{parsedItem.OwnerName}
            </Text>
            <Text style={[styles.infoRow, { color: colors.text }]}>
              <Text style={styles.label}>Subject: </Text>{parsedItem.Subject}
            </Text>
            <Text style={[styles.infoRow, { color: colors.text }]}>
              <Text style={styles.label}>Description: </Text>{parsedItem.Discription}
            </Text>

            <Text style={[styles.createdAt, { color: colors.text }]}>
              <Text style={styles.label}>Created Date: </Text>
              {formatDate(parsedItem.created_date)}
            </Text>
          </View>
        )}

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
              <Image source={{ uri: localUri }} style={styles.modalImage} resizeMode="contain" />
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
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoRow: {
    fontSize: 14,
    marginTop: 4,
  },
  createdAt: {
    marginTop: 10,
    alignSelf: 'flex-end',
    fontSize: 12,
  },
  label: {
    fontWeight: 'bold',
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconWrapper: {
    marginRight: 14,
  },
  docDetails: {
    flex: 1,
  },
  docTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  docDate: {
    fontSize: 12,
    marginTop: 4,
    color: '#888',
  },
  docTypeBadge: {
    backgroundColor: '#eee',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  docTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
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
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalImage: {
    width: width * 0.9,
    height: height * 0.85,
  },
  webView: {
    flex: 1,
    width: width,
  },
});