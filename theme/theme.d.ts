import '@react-navigation/native';
import type { Theme as NavigationTheme } from '@react-navigation/native';

declare module '@react-navigation/native' {
  export interface Theme extends Omit<NavigationTheme, 'colors'> {
    colors: NavigationTheme['colors'] & {
      shadow: string;
      surface: string;
      tabBar: string;
      tabBarActive: string;
      tabBarInactive: string;
      button?: string;
      buttonText?: string;
      cardShadow?: string;
      secondaryCard?: string;
      highlight?: string;
    };
  }
}
