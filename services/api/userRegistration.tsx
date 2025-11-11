import qs from 'qs';
import apiClient from './axiosInstance';

interface UserRegistrationParams {
  CUGNo: string;
  strUserName: string;
  strUserPassword: string;
  strUserMobileNo: string;
  strFullName: string;
  strUserCode: string;
  strAccountId: string;
}

export const userRegistration = async (params: UserRegistrationParams) => {
  try {
    const response = await apiClient.post(
      '/UserRegistration',
      qs.stringify(params)
    );

    console.log('UserRegistration success:', response.data);
    return response.data;
  } catch (error) {
    console.error('UserRegistration error:', error);
    throw error;
  }
};