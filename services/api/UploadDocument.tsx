// services/uploadDocument.ts

import apiClient from './axiosInstance'; // Adjust the path as per your structure

interface UploadDocumentParams {
  szAPIKey: string;
  szDeviceType: string;
  strUserId: string;
  RelatedTo: string;
  RelatedToId: string | number;
  RelatedToName: string;
  strbyte: string; // base64 string
  FileExtension: string;
  DocumentName: string;
  DocumentFileName: string;
}

export const uploadDocument = async (params: UploadDocumentParams) => {
  try {
    const response = await apiClient.post('/uploadDocument', params);
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
