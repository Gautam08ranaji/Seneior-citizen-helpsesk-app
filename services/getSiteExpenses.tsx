// // apis/getSiteExpenses.ts
// import { RootState } from '@/redux/store';
// import axios from 'axios';
// import { Platform } from 'react-native';
// import { useSelector } from 'react-redux';

// const BASE_URL = 'http://43.230.203.249/Workforce/Services/MobileSerivce.asmx';
//  const user = useSelector((state: RootState) => state.user);
// export const getSiteExpenses = async (apiKey: string, deviceType: string, userId: number) => {
//   try {
//     const response = await axios.post(`${BASE_URL}/GetSiteExpenses`, null, {
//       params: {
//         szAPIKey: user.token,
//         szDeviceType: Platform.OS,
//         strUserId: user.id,
//       },
//     });

//     const data = response.data;
//     if (data?.SiteExpenses) {
//       return data.SiteExpenses;
//     } else {
//       throw new Error('Invalid response structure');
//     }
//   } catch (error) {
//     console.error('GetSiteExpenses API Error:', error);
//     throw error;
//   }
// };
