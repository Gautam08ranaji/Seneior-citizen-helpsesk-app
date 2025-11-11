// theme/colors.ts

export interface ThemeType {
  background: {
    screen: string;
    section: string;
    card: string;
    input: string;
    chip: string;
  };
  primary: {
    base: string;
    hover: string;
    pressed: string;
  };
  text: {
    primary: string;
    secondary: string;
    label: string;
    placeholder: string;
    inverse: string;
    chip: string;
  };
  button: {
    primary: {
      bg: string;
      text: string;
      hover: string;
    };
    secondary: {
      bg: string;
      text: string;
      hover: string;
    };
    disabled: {
      bg: string;
      text: string;
    };
  };
  input: {
    border: string;
    focusBorder: string;
    background: string;
  };
  chip: {
    warning: string;
    info: string;
    neutral: string;
  };
  status: {
    success: string;
    error: string;
    warning: string;
  };
  border: {
    default: string;
    subtle: string;
  };
  disabled: string;
   white:string
   notification:string
   fieldText:string
}

// 🟢 Light Theme
export const lightColors: ThemeType = {
  background: {
    screen: "#FFFFFF",
    section: "#EFF3F6",
    card: "#FFFFFF",
    input: "#FFFFFF",
    chip: "#F8F8F8",
  },
  primary: {
    base: "#293160",
    hover: "#1F284C",
    pressed: "#151B33",
  },
  text: {
    primary: "#323232",
    secondary: "#727272",
    label: "#727272",
    placeholder: "#A0A0A0",
    inverse: "#FFFFFF",
    chip: "#323232",
  },
  button: {
    primary: {
      bg: "#293160",
      text: "#FFFFFF",
      hover: "#1F284C",
    },
    secondary: {
      bg: "#F1F1F1",
      text: "#727272",
      hover: "#E2E2E2",
    },
    disabled: {
      bg: "#E8E8E8",
      text: "#A0A0A0",
    },
  },
  input: {
    border: "#D0D0D0",
    focusBorder: "#293160",
    background: "#FFFFFF",
  },
  chip: {
    warning: "#F0A84C",
    info: "#71D6C9",
    neutral: "#6C7AAE",
  },
  status: {
    success: "#1C921C",
    error: "#DF0000",
    warning: "#FFC200",
  },
  border: {
    default: "#D0D0D0",
    subtle: "#E8E8E8",
  },
  disabled: "#CDCDCD",
   white:"#FFF",
   notification:"#293160",
   fieldText:"#1E1E1E"
};

// 🌑 Dark Theme
export const darkColors: ThemeType = {
  background: {
    screen: "#10131A",
    section: "#161A22",
    card: "#1E232C",
    input: "#1E232C",
    chip: "#2C2C2C",
  },
  primary: {
    base: "#AEB8FF",
    hover: "#C6CEFF",
    pressed: "#E2E7FF",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#BEBEBE",
    label: "#A0A0A0",
    placeholder: "#666666",
    inverse: "#293160",
    chip: "#FFFFFF",
  },
  button: {
    primary: {
      bg: "#AEB8FF",
      text: "#1E1E1E",
      hover: "#C6CEFF",
    },
    secondary: {
      bg: "#2E2E2E",
      text: "#BEBEBE",
      hover: "#3A3A3A",
    },
    disabled: {
      bg: "#444444",
      text: "#888888",
    },
  },
  input: {
    border: "#3A3A3A",
    focusBorder: "#AEB8FF",
    background: "#1E232C",
  },
  chip: {
    warning: "#F0A84C",
    info: "#71D6C9",
    neutral: "#6C7AAE",
  },
  status: {
    success: "#40E340",
    error: "#FF4D4D",
    warning: "#FFC200",
  },
  border: {
    default: "#2E2E2E",
    subtle: "#3C3C3C",
  },
  disabled: "#555555",
  white:"#FFF",
  notification:"#FFF",
   fieldText:"#1E1E1E"
};

// Default export for convenience (usually light mode)
export default lightColors;
