import qs from "qs";
import apiClient from "./axiosInstance";

interface GetEmpDashCountParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
  AccountId: number;
}

interface EmpDashCount {
  Total: number;
  PresentCount: number | null;
  AbsentCount: number | null;
  StatusMessage?: string;
  StatusCode?: number;
  AccountId: number; // keep this required
}

export const getEmpDashCount = async (
  params: GetEmpDashCountParams
): Promise<EmpDashCount> => {
  try {
    const response = await apiClient.post(
      "/GetEmpDashCount",
      qs.stringify(params),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("data",response?.data);
    

    const data = response.data;
    const dash = data?.GetEmpDashCount?.[0] ?? {};

    return {
      Total: Number(dash?.Total ?? 0),
      PresentCount: dash?.PresentCount !== null ? Number(dash.PresentCount) : null,
      AbsentCount: dash?.AbsentCount !== null ? Number(dash.AbsentCount) : null,
      StatusMessage: data?.StatusMessage,
      StatusCode: data?.StatusCode,
      AccountId: params.AccountId, // included
    };
  } catch (error: any) {
    console.error("Error in getEmpDashCount:", error);
    throw error;
  }
};
