import { Stack } from 'expo-router';

export default function ExpenseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 🔹 This hides the header
        contentStyle: { backgroundColor: '#121212' },
      }}
    />
  );
}
