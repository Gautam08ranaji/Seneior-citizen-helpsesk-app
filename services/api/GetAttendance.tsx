import qs from 'qs';
import apiClient from './axiosInstance';

interface GetAttendanceParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
  HostIP: string;
  startDate: string;
  endDate: string;
  
}

export const getAttendance = async (params: GetAttendanceParams) => {
  try {
    const response = await apiClient.post(
      '/GetAttendance',
      qs.stringify(params)
    );

    // console.log('GetAttendance success:', response);
    return response.data;
  } catch (error) {
    console.error('GetAttendance error:', error);
    throw error;
  }
};