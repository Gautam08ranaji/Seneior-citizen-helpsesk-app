import axios from "axios";

export const getDashMonthlyTaskStatus = async (
  apiKey: string,
  deviceType: string,
  userId: number
) => {
  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                 xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <DashMonthyWiseTaskStatus xmlns="http://tempuri.org/">
        <szAPIKey>${apiKey}</szAPIKey>
        <szDeviceType>${deviceType}</szDeviceType>
        <UserId>${userId}</UserId>
      </DashMonthyWiseTaskStatus>
    </soap:Body>
  </soap:Envelope>`;

  const response = await axios.post('http://43.230.203.249/Workforce/Services/MobileSerivce.asmx', soapBody, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: 'http://tempuri.org/DashMonthyWiseTaskStatus',
    },
    responseType: 'text', // important!
  });

  const text = response.data;

  // Extract the JSON part from the mixed response
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}') + 1;
  const jsonString = text.substring(jsonStart, jsonEnd);

  const parsedData = JSON.parse(jsonString);
  return parsedData;
};
