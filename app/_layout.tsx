import { colors } from "@presentation/theme/colors";
import { fontFamily } from "@presentation/theme/typography";
import { useAuth } from "@presentation/hooks/useAuth";
import { useProfile } from "@presentation/hooks/useProfile";
import { AppServicesProvider } from "@presentation/providers/AppServicesProvider";
import { ExerciseInfoIndexProvider } from "@presentation/providers/ExerciseInfoIndexProvider";
import { useActiveWorkoutStore } from "@presentation/stores/activeWorkoutStore";
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
          <ExerciseInfoIndexProvider>
            <RootNavigator />
          </ExerciseInfoIndexProvider>
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
  const { user, isLoading: isAuthLoading } = useAuth();
  const { profile, isLoading: isProfileLoading } = useProfile();
  // Wait for the persisted workout so the tabs can resume it on first mount.
  const hasHydratedWorkout = useActiveWorkoutStore((state) => state.hasHydrated);

  if (isAuthLoading || (user && isProfileLoading) || !hasHydratedWorkout) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: styles.screenContent }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(user) && !profile}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(user) && Boolean(profile)}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ficha/novo" options={{ presentation: "modal" }} />
        <Stack.Screen name="ficha/[id]/editar" options={{ presentation: "modal" }} />
        <Stack.Screen name="perfil/editar" options={{ presentation: "modal" }} />
        <Stack.Screen name="progresso/index" />
        <Stack.Screen name="progresso/[exerciseId]" />
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
