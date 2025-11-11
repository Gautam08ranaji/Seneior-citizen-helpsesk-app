import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://43.230.203.249/Workforce/Services/MobileSerivce.asmx",
  timeout: 10000,
});

export default apiClient;
