import qs from 'qs';
import apiClient from './axiosInstance';

interface TaskClaimPayload {
  szAPIKey: string;
  szDeviceType: string;
  strUserId: Number;
  TaskId: string;
  ExpenseType: string;
  ExpenseAmount: string;
  ClaimDateTime: string;
  ClaimRemarks: string;
  strbyte: string; // base64 image string
  FileExtension: string; // e.g., .jpeg
  DocumentName: string;
  DocumentFileName: string;
}

export const submitTaskClaim = async (payload: TaskClaimPayload) => {
  try {
    const response = await apiClient.post(
      '/TaskClaimSubmit',
      qs.stringify(payload), // convert JSON to x-www-form-urlencoded
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('TaskClaimSubmit API Error:', error);
    throw error;
  }
};
