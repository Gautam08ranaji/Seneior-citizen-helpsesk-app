import qs from "qs";
import apiClient from "./axiosInstance";

export interface UploadTaskParams {
  szAPIKey: string;
  szDeviceType: string;
  strUserId: string;
  strbyte: string;
  FileExtension: string;
  DocumentName: string;
  DocumentFileName: string;
  TaskId: string;
  DocNumber: string;
  ImgLatLong: string;  // "lat,long"
  ImgUplodTime: string;
}

export const uploadTaskDocument = async (params: UploadTaskParams) => {
  const data = qs.stringify(params);
  const response = await apiClient.post("/UploadTaskDocument", data);
  return response.data;
};
