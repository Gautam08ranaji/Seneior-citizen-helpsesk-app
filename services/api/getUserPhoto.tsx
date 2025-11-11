// api/userService.ts
import apiClient from './axiosInstance';

export interface GetUserPhotoParams {
  szAPIKey: string;
  szDeviceType: string;
  strUserId: number | string;
}

export const getUserPhoto = async (params: GetUserPhotoParams) => {
  try {
    const response = await apiClient.post(
      '/GetUserPhoto',
      new URLSearchParams({
        szAPIKey: params.szAPIKey,
        szDeviceType: params.szDeviceType,
        strUserId: String(params.strUserId),
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data; // ✅ API result (base64 image, status, etc.)
  } catch (error: any) {
    console.error('Error fetching user photo:', error.message || error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch user photo'
    );
  }
};
