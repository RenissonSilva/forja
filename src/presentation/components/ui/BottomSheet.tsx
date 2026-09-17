import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/spacing";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(6,6,8,0.72)",
    justifyContent: "flex-end",
  },
  backdrop: StyleSheet.absoluteFill,
  sheet: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    borderTopWidth: 1,
    borderColor: colors.border,
    maxHeight: "82%",
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
});
