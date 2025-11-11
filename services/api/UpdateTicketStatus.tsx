// services/api/UpdateTicketStatus.ts
import apiClient from "./axiosInstance";

interface UpdateTicketStatusParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
  TicketId: number;
  statusId: number;
  statusReasonId: number,
  strRemarks: string,
}

export async function updateTicketStatus(params: UpdateTicketStatusParams) {
  try {
    const response = await apiClient.post(
      "/UpdateTicketStatus",
      new URLSearchParams({
        szAPIKey: params.szAPIKey,
        szDeviceType: params.szDeviceType,
        UserId: params.UserId.toString(),
        TicketId: params.TicketId.toString(),
        statusId: params.statusId.toString(),
        statusReasonId: params.statusReasonId.toString(),
        strRemarks: params.strRemarks.toString(),
      })
    );

    return response.data;
  } catch (error) {
    console.error("Error updating ticket status:", error);
    throw error;
  }
}
