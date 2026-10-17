import React from "react";
import { Pressable, Text, StyleSheet, TextInput, TextInputProps } from "react-native";

// Identidade visual do site PointClick
export const colors = {
  bg: "#f8f7f3", card: "#ffffff", imageBg: "#f4f1eb",
  primary: "#8f6f2e", primarySoft: "#f4ead0", gold: "#b08d44",
  text: "#1f1b16", textSoft: "#3f3830", muted: "#71675a",
  border: "#ded7ca", danger: "#b42318", warning: "#a16207", teal: "#0f766e",
};

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
  btn: { backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 999, alignItems: "center" },
  btnOutline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.primary },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, fontSize: 16, color: colors.text },
});

import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function Empty({ icon, text, action }: { icon: keyof typeof Ionicons.glyphMap; text: string; action?: React.ReactNode }) {
  return (
    <View style={{ alignItems: "center", padding: 32, gap: 12 }}>
      <Ionicons name={icon} size={48} color={colors.border} />
      <Text style={{ color: colors.muted, textAlign: "center" }}>{text}</Text>
      {action}
    </View>
  );
}
export function Chip({ label, color }: { label: string; color: string }) {
  return <Text style={{ color, backgroundColor: color + "1F", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, fontSize: 12, fontWeight: "700", overflow: "hidden", alignSelf: "flex-start" }}>{label}</Text>;
}
export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => <Ionicons key={i} name={i <= Math.round(value) ? "star" : "star-outline"} size={size} color={colors.warning} />)}
    </View>
  );
}
export const initials = (name?: string) => (name ?? "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
export const dateBR = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "");
