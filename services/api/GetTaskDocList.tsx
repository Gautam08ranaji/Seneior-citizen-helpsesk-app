// services/taskService.ts
import qs from 'qs';
import apiClient from './axiosInstance';

export const getTaskDocList = async ({
  szAPIKey,
  szDeviceType,
  strUserId,
  TaskId,
}: {
  szAPIKey: string;
  szDeviceType: string;
  strUserId: string;
  TaskId: string;
}) => {
  try {
    const formBody = qs.stringify({
      szAPIKey,
      szDeviceType,
      strUserId,
      TaskId,
    });

    const response = await apiClient.post('/GetTaskDocList', formBody);

    return response.data;
  } catch (error) {
    console.error('Error fetching task doc list:', error);
    throw error;
  }
};
