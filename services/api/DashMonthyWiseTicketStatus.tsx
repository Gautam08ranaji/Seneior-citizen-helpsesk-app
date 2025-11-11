// services/dashboardService.ts
import qs from "qs";
import apiClient from "./axiosInstance";

interface GetEmpDashCountParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
}

interface EmpDashCount {
  Total: number;
  OPEN: number | null;
  CLOSE: number | null;
  WORKING: number | null;
  StatusMessage?: string;
  StatusCode?: number;
}

export const GetDashMonthyWiseTicketStatus = async (
  params: GetEmpDashCountParams
): Promise<EmpDashCount> => {
  try {
    const response = await apiClient.post(
      "/DashMonthyWiseTicketStatus",
      qs.stringify(params),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = response.data;
    const dash = data?.DashMonthyWiseTicketStatus?.[0] ?? {};

    return {
      Total: Number(dash?.TOTAL ?? 0),   // ✅ use TOTAL from API
      OPEN: dash?.OPEN !== undefined ? Number(dash.OPEN) : null,
      CLOSE: dash?.CLOSE !== undefined ? Number(dash.CLOSE) : null,
      WORKING: dash?.WORKING !== undefined ? Number(dash.WORKING) : null,
      StatusMessage: data?.StatusMessage,
      StatusCode: data?.StatusCode,
    };
  } catch (error: any) {
    console.error("Error in getEmpDashCount:", error);
    throw error;
  }
};
