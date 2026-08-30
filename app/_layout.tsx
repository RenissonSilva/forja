import { colors } from "@presentation/theme/colors";
import { fontFamily } from "@presentation/theme/typography";
import { useProfile } from "@presentation/hooks/useProfile";
import { AppServicesProvider } from "@presentation/providers/AppServicesProvider";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <AppServicesProvider>
          <RootNavigator />
        </AppServicesProvider>
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            style: { backgroundColor: colors.surfaceDeep, borderColor: colors.border },
            titleStyle: { fontFamily: fontFamily.medium, color: colors.textPrimary },
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: styles.screenContent }}>
      <Stack.Protected guard={!profile}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(profile)}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ficha/novo" options={{ presentation: "modal" }} />
        <Stack.Screen name="ficha/[id]/editar" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="treino/[fichaId]/sessao"
          options={{ presentation: "fullScreenModal" }}
        />
      </Stack.Protected>
    </Stack>
  );
}

const styles = {
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  screenContent: { backgroundColor: colors.background },
};
