import apiClient from "./axiosInstance";

export async function updateTaskStatus(params: {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
  TicketId: number;
  statusId: number;

}) {
  const url = "/UpdateTicketStatus";

  const formData = new URLSearchParams({
    szAPIKey: params.szAPIKey,
    szDeviceType: params.szDeviceType,
    UserId: params.UserId.toString(),
    TicketId: params.TicketId.toString(),
    statusId: params.statusId.toString(),
  }).toString();

  const response = await apiClient.post(url, formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data;
}
