// theme/ThemeContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, ThemeType } from "./Colors";

// Define the context type
interface ThemeContextProps {
  theme: ThemeType;
  mode: "light" | "dark";
  toggleTheme: () => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme(); // detects system light/dark
  const [mode, setMode] = useState<"light" | "dark">(
    systemScheme === "dark" ? "dark" : "light"
  );

  // Automatically update theme when system changes
  useEffect(() => {
    if (systemScheme) {
      setMode(systemScheme === "dark" ? "dark" : "light");
    }
  }, [systemScheme]);

  // Toggle between light and dark manually
  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Select theme object based on mode
  const theme = mode === "dark" ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useAppTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
};
