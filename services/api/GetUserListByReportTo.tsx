// api/userService.ts
import apiClient from './axiosInstance';

export interface GetUserListParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number | string;
  AccountId: number
}

export const getUserListByReportTo = async (params: GetUserListParams) => {
  try {
    const response = await apiClient.post(
      '/GetUserListByReportTo',
      new URLSearchParams({
        szAPIKey: params.szAPIKey,
        szDeviceType: params.szDeviceType,
        UserId: String(params.UserId),
        AccountId:String(params.AccountId)
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    // console.log("getuserlistbyreportto", response?.data);

    // If the API returns XML, you might need to parse it here
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user list:', error.message || error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch user list'
    );
  }
};
