// // hooks/useLivenessDetection.ts
// import { useRef, useState } from 'react';
// import { Alert } from 'react-native';

// export interface LivenessResult {
//   isLive: boolean;
//   confidence: number;
//   reasons: string[];
// }

// export const useLivenessDetection = () => {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const motionData = useRef<{ timestamps: number[] }>({ timestamps: [] });

//   // Simple motion detection by analyzing multiple rapid captures
//   const detectLiveness = async (captureFunction: () => Promise<string[]>): Promise<LivenessResult> => {
//     setIsProcessing(true);
//     const reasons: string[] = [];
    
//     try {
//       console.log('Starting motion-based liveness detection...');
      
//       // Capture 3 rapid photos to detect motion
//       const photoUris = await captureFunction();
      
//       if (photoUris.length < 3) {
//         reasons.push('Failed to capture multiple frames');
//         return {
//           isLive: false,
//           confidence: 0,
//           reasons
//         };
//       }

//       // Check if photos are different (indicating live movement)
//       const differences = await analyzePhotoDifferences(photoUris);
      
//       if (differences < 0.1) { // Threshold for minimum movement
//         reasons.push('No movement detected - possible static image');
//       }

//       // Additional checks can be added here
//       const confidence = differences > 0.1 ? 0.8 : 0.3;

//       return {
//         isLive: reasons.length === 0,
//         confidence,
//         reasons
//       };

//     } catch (error) {
//       console.error('Liveness detection error:', error);
//       return {
//         isLive: false,
//         confidence: 0,
//         reasons: ['Detection failed: ' + (error as Error).message]
//       };
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Simple photo difference analysis
//   const analyzePhotoDifferences = async (photoUris: string[]): Promise<number> => {
//     // In a real implementation, you would compare the images
//     // For now, we'll return a simulated value that assumes some movement
//     return Math.random() * 0.3 + 0.1; // Simulates 10-40% difference
//   };

//   // Challenge-response liveness check
//   const performLivenessChallenge = async (): Promise<boolean> => {
//     return new Promise((resolve) => {
//       Alert.alert(
//         'Liveness Check',
//         'Please perform this action to prove you are live:\n\n1. Blink your eyes 3 times\n2. Move your head slightly\n3. Tap OK when ready',
//         [
//           {
//             text: 'Cancel',
//             style: 'cancel',
//             onPress: () => resolve(false)
//           },
//           {
//             text: 'OK, I\'m Ready',
//             onPress: () => resolve(true)
//           }
//         ]
//       );
//     });
//   };

//   return {
//     detectLiveness,
//     performLivenessChallenge,
//     isProcessing
//   };
// };