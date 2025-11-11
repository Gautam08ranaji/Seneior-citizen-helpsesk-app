// services/documentService.ts or similar file
import qs from 'qs';
import apiClient from './axiosInstance'; // update path as needed

export const getRelatedDocument = async (
  szAPIKey: string,
  szDeviceType: string,
  UserId: number,
  DocumentId: number
) => {
  try {
    const formData = qs.stringify({
      szAPIKey,
      szDeviceType,
      UserId,
      DocumentId,
    });

    const response = await apiClient.post('/GetRelatedDocument', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data; // response may be XML or plain text
  } catch (error: any) {
    console.error('GetRelatedDocument error:', error.message);
    throw error;
  }
};
