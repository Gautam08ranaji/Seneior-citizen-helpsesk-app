// src/api/addRequisition.ts
import qs from 'qs';
import apiClient from "./axiosInstance";

interface AddRequisitionParams {
  szAPIKey: string;
  szDeviceType: string;
  strUserId: Number;
  TaskId: string;
  TaskNumber: string;
  Subject:string
  Discriptions:string
}

export const addRequisition = async (params: AddRequisitionParams) => {
  try {
    const response = await apiClient.post(
      '/AddRequisition',
      qs.stringify(params)
    );

    console.log('AddRequisition success:', response.data);
    return response.data;
  } catch (error) {
    console.error('AddRequisition error:', error);
    throw error;
  }
};
