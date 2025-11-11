import qs from 'qs';
import apiClient from './axiosInstance';

interface InsertAttendanceParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
  HostIP: string;
  Status: string;
  JioLocation: string;
  LatLong:string;
}

export const insertAttendance = async (params: InsertAttendanceParams) => {
  try {
    const response = await apiClient.post(
      '/InsertAttendance',
      qs.stringify(params)
    );

    console.log('InsertAttendance success:', response);
    return response.data;
  } catch (error) {
    console.error('InsertAttendance error:', error);
    throw error;
  }
};