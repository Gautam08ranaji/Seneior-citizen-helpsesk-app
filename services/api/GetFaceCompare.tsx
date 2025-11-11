import qs from "qs"; // install with `npm install qs`
import apiClient from "./axiosInstance";

interface FaceCompareParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
  EncodedImage1: string; // base64 string
}

export const getFaceCompare = async (params: FaceCompareParams) => {
  try {
    const response = await apiClient.post(
      "/GetFaceCompare",
      qs.stringify({
        szAPIKey: params.szAPIKey,
        szDeviceType: params.szDeviceType,
        UserId: params.UserId,
        EncodedImage1: params.EncodedImage1,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // console.log("face api", response);
    return response.data;
  } catch (error) {
    console.error("GetFaceCompare API Error:", error);
    throw error;
  }
};
