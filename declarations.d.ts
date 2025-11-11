// ✅ keep your existing svg declaration
declare module "*.svg" {
  import * as React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

// ✅ add this new declaration for react-native-calendars
declare module "react-native-calendars" {
  import * as React from "react";
  import { ViewStyle } from "react-native";

  export interface DateObject {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
  }

  export interface MarkedDates {
    [date: string]: {
      selected?: boolean;
      marked?: boolean;
      selectedColor?: string;
      dotColor?: string;
      disabled?: boolean;
      disableTouchEvent?: boolean;
    };
  }

  export interface CalendarProps {
    current?: string;
    minDate?: string;
    maxDate?: string;
    onDayPress?: (day: DateObject) => void;
    onDayLongPress?: (day: DateObject) => void;
    monthFormat?: string;
    hideExtraDays?: boolean;
    markedDates?: MarkedDates;
    theme?: Record<string, any>;
    style?: ViewStyle;
  }

  export class Calendar extends React.Component<CalendarProps> {}
}
// ✅ add this new declaration for react-native-material-symbols
declare module "react-native-material-symbols" {
  import * as React from "react";
  import { StyleProp, ViewStyle } from "react-native";

  export interface IconProps {
    /** Icon name (use underscore, e.g. "skull_list") */
    name: string;
    /** Icon size in px */
    size?: number;
    /** Color of the icon */
    color?: string;
    /** Variant of the icon */
    type?: "outlined" | "rounded" | "sharp";
    /** Custom style */
    style?: StyleProp<ViewStyle>;
  }

  const Icon: React.FC<IconProps>;
  export default Icon;
}
