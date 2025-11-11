// services/api/getAttendance.ts
import { AxiosResponse } from "axios";
import apiClient from "./axiosInstance";

export interface AttendanceRecord {
  Id: number;
  Name: string;
  contact_phone: string;
  AttanDate: string;          // YYYY-MM-DD
  CheckInTime: string | null; // HH:MM:SS
  CheckOutTime: string | null;
  CheckInLatLong: string | null;
  CheckOutLatLong: string | null;
  CheckInLocation: string | null;
  CheckOutLocation: string | null;
}

export interface GetAttendanceResponse {
  GetAttendance: AttendanceRecord[];
  StatusMessage: string;
  StatusCode: number;
}

export interface GetAttendanceParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
  startDate: string; // format: YYYY-MM-DD
  endDate: string;   // format: YYYY-MM-DD
}

export const getAttendance = async (
  params: GetAttendanceParams
): Promise<GetAttendanceResponse> => {
  try {
    const response: AxiosResponse<GetAttendanceResponse> = await apiClient.post(
      "/GetAttendance",
      new URLSearchParams({
        szAPIKey: params.szAPIKey,
        szDeviceType: params.szDeviceType,
        UserId: params.UserId.toString(),
        startDate: params.startDate,
        endDate: params.endDate,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("GetAttendance API Error:", error);
    // Return a default empty response in case of error
    return {
      GetAttendance: [],
      StatusMessage: "Error fetching attendance",
      StatusCode: 500,
    };
  }
};
