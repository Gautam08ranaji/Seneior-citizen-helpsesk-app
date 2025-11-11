import apiClient from "./axiosInstance";

interface GetCaseTaskStatusReasonParams {
  szAPIKey: string;
  szDeviceType: string;
  strUserId: number;
  szStatusId: string;
}

export async function getCaseTaskStatusReason(params: GetCaseTaskStatusReasonParams) {
  const response = await apiClient.post(
    "/GetCaseTaskStatusReason",
    params
  );
  return response.data;
}
