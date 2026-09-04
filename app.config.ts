import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "FORJA",
  slug: "forja",
  version: "0.1.0",
  scheme: "forja",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "dark",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.forja.app",
  },
  android: {
    package: "com.forja.app",
    adaptiveIcon: {
      backgroundColor: "#0A0A0B",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-web-browser",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        backgroundColor: "#0A0A0B",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
