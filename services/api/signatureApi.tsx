// signatureApi.ts
import qs from "qs";
import apiClient from "./axiosInstance";

interface GenerateSignatureParams {
  szAPIKey: string;
  szDeviceType: string;
  strUserId: number;
  TicketId: number;
  strbyte: string;
  extension: string;
}

export const generateSignature = async (params: GenerateSignatureParams) => {
  const formData = qs.stringify({
    szAPIKey: params.szAPIKey,
    szDeviceType: params.szDeviceType,
    strUserId: params.strUserId,
    TicketId: params.TicketId,
    strbyte: params.strbyte,
    extension: params.extension,
  });

  const response = await apiClient.post("/GenerateSignature", formData);

  return response.data; // XML string
};
