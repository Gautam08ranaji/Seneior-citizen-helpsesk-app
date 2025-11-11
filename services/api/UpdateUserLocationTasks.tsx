// locationApi.ts
import apiClient from "./axiosInstance";

interface UpdateUserLocationParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
  TaskId: string;
  DriverCurrentLocName: string;
  Laltitue: string;
  Longitute: string;
}

export const updateUserLocationTasks = async (params: UpdateUserLocationParams) => {
  const formData = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  const response = await apiClient.post("/UpdateUserLocation_Task", formData.toString());
  return response.data;
};
