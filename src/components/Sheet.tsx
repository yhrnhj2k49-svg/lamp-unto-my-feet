import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { space } from "../theme";
import { usePalette } from "../usePalette";

type Props = { visible: boolean; label: string; onDismiss?: () => void; children: ReactNode };

/** A card that rises from the bottom over a dimmed page. */
export default function Sheet({ visible, label, onDismiss, children }: Props) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss} statusBarTranslucent>
      <View style={s.fill}>
        <Pressable
          style={s.scrim}
          onPress={onDismiss}
          disabled={!onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View
          accessibilityViewIsModal
          accessibilityLabel={label}
          style={[
            s.card,
            { backgroundColor: c.panel, borderColor: c.rule, paddingBottom: insets.bottom + space.lg },
          ]}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, justifyContent: "flex-end" },
  scrim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(10,12,28,0.5)" },
  card: {
    borderTopWidth: 1,
    paddingHorizontal: 22,
    paddingTop: space.lg,
    gap: space.md,
    maxWidth: 760,
    width: "100%",
    alignSelf: "center",
  },
});
