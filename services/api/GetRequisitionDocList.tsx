// services/requisitionService.ts
import qs from 'qs';
import apiClient from './axiosInstance';

interface GetRequisitionDocListParams {
  szAPIKey: string;
  szDeviceType: string;
  strUserId: number;
  RequisitionId: string;
}

export const getRequisitionDocList = async (params: GetRequisitionDocListParams) => {
  try {
    const response = await apiClient.post(
      '/GetRequisitionDocList',
      qs.stringify(params)
    );

    // Check for response format (likely XML or JSON string inside XML)
    return response.data;
  } catch (error) {
    console.error('Error fetching requisition doc list:', error);
    throw error;
  }
};
