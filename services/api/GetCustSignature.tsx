// services/getCustSignature.ts
import apiClient from "./axiosInstance";

interface GetCustSignatureParams {
  szAPIKey: string;
  szDeviceType: string;
  strUserId: number;
  TicketId: string;
}

export async function getCustSignature(paramsInput: GetCustSignatureParams) {
  const params = new URLSearchParams({
    szAPIKey: paramsInput.szAPIKey,
    szDeviceType: paramsInput.szDeviceType,
    strUserId: String(paramsInput.strUserId),
    TicketId: paramsInput.TicketId,
  });

  const { data } = await apiClient.post(
    "/GetCustSignatureByTicketId",
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  // console.log("RAW XML (actually JSON):", data);

  // If server returned a JSON object already:
  if (typeof data === "object") return data;

  // If server returned a JSON string
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
