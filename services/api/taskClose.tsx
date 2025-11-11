import apiClient from "@/services/api/axiosInstance";

export const taskClose = async ({
  szAPIKey,
  szDeviceType,
  UserId,
  TicketId,
  Remarks,
}: {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
  TicketId:  string;
  Remarks: string;
}) => {
  const body = new URLSearchParams({
    szAPIKey,
    szDeviceType,
    UserId: String(UserId),
    TicketId: String(TicketId),
    Remarks,
  });

  const response = await apiClient.post("/CaseClose", body.toString());
  return response.data; // Note: this will be XML
};
