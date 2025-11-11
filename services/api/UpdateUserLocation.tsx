// locationApi.ts
import apiClient from "./axiosInstance";

interface UpdateUserLocationParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
  UserCurrentLocName: string;
  Laltitue: string;
  Longitute: string;
  UserStatus: string;
}

export const updateUserLocation = async (params: UpdateUserLocationParams) => {
  const formData = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  const response = await apiClient.post("/UpdateUserLocation", formData.toString());
  return response.data;
};
