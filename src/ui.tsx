import React from "react";
import { Pressable, Text, StyleSheet, TextInput, TextInputProps } from "react-native";

export const colors = { bg: "#f5f6f8", card: "#fff", primary: "#2563eb", text: "#111827", muted: "#6b7280", danger: "#dc2626", border: "#e5e7eb" };

export function Button({ title, onPress, disabled, variant = "primary" }: { title: string; onPress: () => void; disabled?: boolean; variant?: "primary" | "outline" }) {
  const outline = variant === "outline";
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[s.btn, outline && s.btnOutline, disabled && { opacity: 0.5 }]}>
      <Text style={[s.btnText, outline && { color: colors.primary }]}>{title}</Text>
    </Pressable>
  );
}
export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.muted} autoCapitalize="none" {...props} style={[s.input, props.style]} />;
}
const s = StyleSheet.create({
  btn: { backgroundColor: colors.primary, padding: 14, borderRadius: 10, alignItems: "center" },
  btnOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.primary },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 16, color: colors.text },
});
