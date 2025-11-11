// services/api/auth.ts
import apiClient from "./axiosInstance";

export const validateLogin = async ({
  strLoginId,
  strPwd,
  szDeviceType,
}: {
  strLoginId: string;
  strPwd: string;
  szDeviceType: string;
}) => {
  try {
    const response = await apiClient.post(
      "/ValidateLogin",
      new URLSearchParams({
        strLoginId,
        strPwd,
        szDeviceType,
      })
    );

    return response.data; // raw JSON response
  } catch (error) {
    console.error("ValidateLogin error:", error);
    throw error;
  }
};
