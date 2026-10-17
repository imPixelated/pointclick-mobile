import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { useAuth } from "../../src/auth";
import { useFavorites } from "../../src/favorites";
import { Button, colors, initials } from "../../src/ui";

function Row({ icon, label, onPress, badge }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; badge?: number }) {
  return (
    <Pressable style={s.row} onPress={onPress}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={s.rowText}>{label}</Text>
      {badge ? <Text style={s.badge}>{badge}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

export default function Account() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { items } = useFavorites();
  const [unread, setUnread] = useState(0);
  useFocusEffect(useCallback(() => {
    if (user) api<Record<string, number>>("/notifications/unread-count").then((r) => setUnread(Number(Object.values(r)[0] ?? 0))).catch(() => {});
  }, [user]));

  if (!user) {
    return (
      <View style={s.guest}>
        <Ionicons name="person-circle-outline" size={72} color={colors.border} />
        <Text style={s.hello}>Bem-vindo à PointClick</Text>
        <Text style={s.muted}>Entre para comprar, acompanhar pedidos e salvar favoritos.</Text>
        <View style={{ alignSelf: "stretch", gap: 10, marginTop: 8 }}>
          <Button title="Entrar" onPress={() => router.push("/login")} />
          <Button title="Criar conta" variant="outline" onPress={() => router.push("/register")} />
        </View>
      </View>
    );
  }
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View style={s.profile}>
        <View style={s.avatar}><Text style={s.avatarText}>{initials(user.fullName)}</Text></View>
        <View style={{ flex: 1 }}><Text style={s.name}>{user.fullName}</Text><Text style={s.muted}>{user.email}</Text></View>
      </View>
      <View style={s.card}>
        <Row icon="person-outline" label="Meus dados e endereço" onPress={() => router.push("/profile")} />
        <Row icon="receipt-outline" label="Meus pedidos" onPress={() => router.push("/(tabs)/orders")} />
        <Row icon="heart-outline" label="Favoritos" badge={items.length} onPress={() => router.push("/favorites")} />
        <Row icon="notifications-outline" label="Notificações" badge={unread} onPress={() => router.push("/notifications")} />
      </View>
      <Button title="Sair da conta" variant="outline" onPress={() => Alert.alert("Sair", "Deseja sair da conta?", [{ text: "Não" }, { text: "Sair", style: "destructive", onPress: logout }])} />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  guest: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 8, backgroundColor: colors.bg },
  hello: { fontSize: 22, fontWeight: "800", color: colors.text },
  muted: { color: colors.muted, textAlign: "center" },
  profile: { flexDirection: "row", gap: 14, alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 22, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.primary, fontWeight: "800", fontSize: 20 },
  name: { fontSize: 18, fontWeight: "800", color: colors.text },
  card: { backgroundColor: "#fff", borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowText: { flex: 1, fontWeight: "600", color: colors.text },
  badge: { backgroundColor: colors.primary, color: "#fff", fontWeight: "800", fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: "hidden" },
});
