import qs from 'qs';
import apiClient from './axiosInstance';

interface UploadSelfiParams {
  szAPIKey: string;
  szDeviceType: string;
  strUserId: number;
  strbyte: string; // base64 encoded string of the image
  FileExtension: string; // e.g. "jpg", "png"
  DocumentFileName: string; // e.g. "selfie.jpg"
}

export const uploadSelfi = async (params: UploadSelfiParams) => {
  try {
    const response = await apiClient.post(
      '/UploadSelfi',
      qs.stringify(params),
      {
        
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('UploadSelfi success:', response);
    return response.data;
  } catch (error) {
    console.error('UploadSelfi error:', error);
    throw error;
  }
};