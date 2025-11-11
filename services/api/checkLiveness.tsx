import axios from "axios";

interface LivenessCheckParams {
  szAPIKey: string;
  szDeviceType: string;
  UserId: number;
  EncodedImage: string;
}

export interface LivenessResponse {
  StatusCode: number;
  IsLive?: boolean;
  Status?: string;
  Confidence?: number;
  Message?: string;
}

// Alternative MXFace endpoints (try these in order)
const MXFACE_ENDPOINTS = [
  "https://faceapi.mxface.ai/api/v3/face/liveness", // Most common endpoint
  "https://faceapi.mxface.ai/api/v2/face/liveness", // Try v2 if v3 fails
  "https://api.mxface.ai/v1/face/liveness", // Alternative base URL
];

const SUBSCRIPTION_KEY = "vWsewhMlrAFhOHEBOj-fem6Snx0ov4503";

export const checkLiveness = async (params: LivenessCheckParams): Promise<LivenessResponse> => {
  // First, verify the image data
  if (!params.EncodedImage || params.EncodedImage.length < 100) {
    return {
      StatusCode: 400,
      Message: "Invalid image data",
      IsLive: false,
      Status: "Error"
    };
  }

  console.log(`📸 Starting liveness check for UserId: ${params.UserId}`);
  console.log(`📊 Image data size: ${params.EncodedImage.length} chars`);

  let lastError = null;

  // Try different endpoints
  for (const endpoint of MXFACE_ENDPOINTS) {
    try {
      console.log(`🔄 Trying endpoint: ${endpoint}`);
      
      const response = await axios.post(
        endpoint,
        {
          encoded_image: params.EncodedImage
        },
        {
          headers: {
            "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY, // Try this header format
            "subscriptionkey": SUBSCRIPTION_KEY, // And this one
            "Content-Type": "application/json",
          },
          timeout: 10000
        }
      );

      console.log("✅ MXFace API call successful to:", endpoint);
      console.log("🔍 Raw MXFace response:", response.data);

      const mxfaceData = response.data;
      
      // Parse response based on common MXFace response structures
      let isLive = false;
      let status = "Unknown";
      let confidence = 0;
      let message = "Liveness check completed";

      // Try different response formats
      if (mxfaceData.isLive !== undefined) {
        isLive = Boolean(mxfaceData.isLive);
        status = isLive ? "Live" : "Not Live";
      } 
      else if (mxfaceData.liveness !== undefined) {
        isLive = mxfaceData.liveness === 'Live' || mxfaceData.liveness === true;
        status = String(mxfaceData.liveness);
      }
      else if (mxfaceData.result !== undefined) {
        isLive = mxfaceData.result === 'Live';
        status = mxfaceData.result;
      }

      if (mxfaceData.confidence !== undefined) {
        confidence = Number(mxfaceData.confidence);
      }
      if (mxfaceData.score !== undefined) {
        confidence = Number(mxfaceData.score);
      }

      if (mxfaceData.message) {
        message = mxfaceData.message;
      }

      const result: LivenessResponse = {
        StatusCode: 200,
        IsLive: isLive,
        Status: status,
        Confidence: confidence,
        Message: message
      };

      console.log(`🎯 Liveness Result: ${result.Status}, Live: ${result.IsLive}, Confidence: ${result.Confidence}`);
      return result;
      
    } catch (error: any) {
      lastError = error;
      console.log(`❌ Endpoint failed: ${endpoint}`, error.message);
      
      // If it's not a 404, return immediately (other errors might be auth, etc.)
      if (error.response?.status !== 404) {
        break;
      }
      
      // If it's 404, try the next endpoint
      continue;
    }
  }

  // If all endpoints failed
  console.error("💥 All MXFace endpoints failed:", lastError);
  
  return {
    StatusCode: lastError?.response?.status || 500,
    Message: lastError?.response?.data?.message || "All liveness endpoints failed",
    IsLive: false,
    Status: "Error"
  };
};