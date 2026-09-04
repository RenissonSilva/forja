import { Button } from "@presentation/components/ui/Button";
import { GoogleIcon } from "@presentation/components/ui/GoogleIcon";
import { Icon } from "@presentation/components/ui/Icon";
import { TextField } from "@presentation/components/ui/TextField";
import { useAppServices } from "@presentation/providers/AppServicesProvider";
import { useAuth } from "@presentation/hooks/useAuth";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CadastroScreen() {
  const { signUp, signInWithGoogle } = useAuth();
  const services = useAppServices();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);

  async function goToNextScreen() {
    const profile = await services.profile.get.execute();
    router.replace(profile ? "/(tabs)" : "/criar-perfil");
  }

  async function handleSubmit() {
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage("Informe e-mail e senha.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp({ email, password });
      if (result.requiresEmailConfirmation) {
        setConfirmationSentTo(result.user.email);
      } else {
        await goToNextScreen();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível criar sua conta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setErrorMessage(null);
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      await goToNextScreen();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível entrar com o Google.",
      );
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  if (confirmationSentTo) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.confirmationContent}>
          <Text style={styles.title}>Confirme seu e-mail</Text>
          <Text style={styles.subtitle}>
            Enviamos um link de confirmação para {confirmationSentTo}. Abra o e-mail e confirme
            para poder entrar.
          </Text>
          <Button label="Ir para o login" onPress={() => router.replace("/login")} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={15} color={colors.textPrimary} strokeWidth={2.2} />
        </Pressable>

        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Leva menos de um minuto para começar.</Text>

        <TextField
          label="E-MAIL"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@email.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <TextField
          label="SENHA"
          value={password}
          onChangeText={setPassword}
          placeholder="Mínimo de 8 caracteres"
          secureTextEntry
        />
        <TextField
          label="CONFIRMAR SENHA"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repita a senha"
          secureTextEntry
        />
      </ScrollView>

      <View style={styles.footer}>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <Button label="Criar conta" onPress={handleSubmit} loading={isSubmitting} />
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>
        <Button
          label="Continuar com Google"
          variant="secondary"
          icon={<GoogleIcon size={18} />}
          onPress={handleGoogleSignIn}
          loading={isGoogleSubmitting}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/login")}
          style={styles.signupLink}
        >
          <Text style={styles.signupLinkText}>
            Já tem conta? <Text style={styles.signupLinkHighlight}>Entrar</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.xxl, paddingTop: spacing.lg, gap: spacing.lg },
  confirmationContent: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: "center",
    gap: spacing.lg,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: { ...typography.sectionTitle, color: colors.textPrimary },
  subtitle: {
    fontFamily: fontFamily.light,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  error: { ...typography.caption, color: colors.danger },
  divider: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontFamily: fontFamily.medium, fontSize: 12.5, color: colors.textMuted },
  signupLink: { alignItems: "center", marginTop: spacing.xs },
  signupLinkText: { fontFamily: fontFamily.medium, fontSize: 13.5, color: colors.textSecondary },
  signupLinkHighlight: { color: colors.primary, fontFamily: fontFamily.semiBold },
});
