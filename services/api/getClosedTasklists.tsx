import qs from 'qs';
import apiClient from './axiosInstance';

interface GetClosedTasklistsParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: string | number;
}

export const getClosedTasklists = async (params: GetClosedTasklistsParams) => {
  const body = qs.stringify(params);

  try {
    const response = await apiClient.post('/GetClosedTasklists', body);
    return response.data;
  } catch (error) {
    console.error('Error fetching closed tasklists:', error);
    throw error;
  }
};
