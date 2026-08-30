import { TextStyle } from "react-native";

/** Loaded via useFonts in AppServicesProvider — see @expo-google-fonts/sora. */
export const fontFamily = {
  light: "Sora_300Light",
  regular: "Sora_400Regular",
  medium: "Sora_500Medium",
  semiBold: "Sora_600SemiBold",
  bold: "Sora_700Bold",
} as const;

export const typography = {
  display: {
    fontFamily: fontFamily.semiBold,
    fontSize: 40,
    lineHeight: 43,
    letterSpacing: -1.4,
  } satisfies TextStyle,
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -1,
  } satisfies TextStyle,
  screenTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.6,
  } satisfies TextStyle,
  heading: { fontFamily: fontFamily.semiBold, fontSize: 15, lineHeight: 20 } satisfies TextStyle,
  body: { fontFamily: fontFamily.light, fontSize: 15, lineHeight: 24 } satisfies TextStyle,
  bodyStrong: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15.5,
    lineHeight: 20,
  } satisfies TextStyle,
  caption: { fontFamily: fontFamily.light, fontSize: 11.5, lineHeight: 17 } satisfies TextStyle,
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    lineHeight: 15,
    letterSpacing: 0.3,
  } satisfies TextStyle,
} as const;
