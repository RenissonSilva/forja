import { Button } from "@presentation/components/ui/Button";
import { Icon } from "@presentation/components/ui/Icon";
import { TextField } from "@presentation/components/ui/TextField";
import { useAuth } from "@presentation/hooks/useAuth";
import { useProfile } from "@presentation/hooks/useProfile";
import { colors } from "@presentation/theme/colors";
import { spacing } from "@presentation/theme/spacing";
import { fontFamily, typography } from "@presentation/theme/typography";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export default function EditarPerfilScreen() {
  const { profile, update } = useProfile();
  const { signOut } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatarUri ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!profile) return null;

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    const asset = result.assets?.[0];
    if (!result.canceled && asset) {
      setAvatarUri(asset.uri);
    }
  }

  async function handleSave() {
    setErrorMessage(null);
    if (name.trim().length === 0) {
      setErrorMessage("Informe seu nome.");
      return;
    }

    setIsSubmitting(true);
    try {
      await update({ name, avatarUri });
      toast.success("Perfil atualizado");
      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível atualizar seu perfil.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="chevron-left" size={15} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
          <Text style={styles.title}>Editar perfil</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Alterar foto de perfil"
          onPress={pickAvatar}
          style={styles.avatarPicker}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <Text style={styles.avatarPlaceholder}>foto{"\n"}opcional</Text>
          )}
          <View style={styles.avatarAddBadge}>
            <Icon name="plus" size={14} color={colors.onPrimary} strokeWidth={2.6} />
          </View>
        </Pressable>

        <TextField
          label="NOME"
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          autoCapitalize="words"
        />
      </ScrollView>

      <View style={styles.footer}>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <Button label="Salvar" onPress={handleSave} loading={isSubmitting} />
        <Pressable
          accessibilityRole="button"
          onPress={handleSignOut}
          disabled={isSigningOut}
          style={styles.signOutLink}
        >
          <Text style={styles.signOutLinkText}>
            {isSigningOut ? "Saindo..." : "Sair da conta"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.xxl, gap: spacing.lg },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...typography.sectionTitle, color: colors.textPrimary },
  avatarPicker: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSunken,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.md,
  },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    color: colors.textFaint,
    textAlign: "center",
  },
  avatarAddBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  error: { ...typography.caption, color: colors.danger },
  signOutLink: { alignItems: "center", marginTop: spacing.xs },
  signOutLinkText: { fontFamily: fontFamily.medium, fontSize: 13.5, color: colors.textSecondary },
});
