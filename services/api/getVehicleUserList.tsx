// src/api/getVehicleUserList.ts
import qs from 'qs';
import apiClient from './axiosInstance';

interface GetVehicleUserListParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
  AccountId: number;
}

export const getVehicleUserList = async (params: GetVehicleUserListParams) => {
  try {
    const response = await apiClient.post(
      '/GetVehicleUserList',
      qs.stringify(params),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // console.log('GetVehicleUserList success:', response.data);
    return response.data;
  } catch (error) {
    console.error('GetVehicleUserList error:', error);
    throw error;
  }
};