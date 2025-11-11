// requisitionApi.ts
import qs from 'qs';
import apiClient from './axiosInstance';

interface GetRequisitionlistTaskParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
  TicketId: number;
}

export const GetRequisitionByTicketId = async (params: GetRequisitionlistTaskParams) => {
  const data = qs.stringify(params);

  try {
    const response = await apiClient.post('/GetRequisitionByTicketId', data);

    // console.log("Requisition doc list",response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching requisition list by task:', error);
    throw error;
  }
};
