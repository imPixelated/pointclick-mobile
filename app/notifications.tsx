import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../src/api";
import { NOTIF_ICON, Notif } from "../src/types";
import { colors, dateBR, Empty } from "../src/ui";

export default function Notifications() {
  const router = useRouter();
  const [items, setItems] = useState<Notif[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => { try { setItems(await api<Notif[]>("/notifications")); } catch {} }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const open = async (n: Notif) => {
    if (!n.read) {
      try { await api(`/notifications/${n.id}/read`, { method: "PATCH" }); setItems((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x))); } catch {}
    }
    const m = (n.linkUrl ?? "").match(/(\d+)/);
    if (m && /pedido|order/i.test(n.linkUrl ?? "")) router.push(`/order/${m[1]}`);
  };
  const readAll = async () => {
    try { await api("/notifications/read-all", { method: "PATCH" }); setItems((l) => l.map((x) => ({ ...x, read: true }))); } catch (e: any) { Alert.alert("Erro", e.message); }
  };

  return (
    <>
      <Stack.Screen options={{ headerRight: () => (items.some((n) => !n.read) ? <Text onPress={readAll} style={{ color: colors.primary, fontWeight: "700" }}>Ler todas</Text> : null) }} />
      <FlatList
        style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 12, gap: 10 }}
        data={items} keyExtractor={(n) => String(n.id)}
        refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
        ListEmptyComponent={<Empty icon="notifications-outline" text="Nenhuma notificação por enquanto." />}
        renderItem={({ item: n }) => (
          <Pressable style={[s.card, !n.read && s.unread]} onPress={() => open(n)}>
            <View style={s.icon}><Ionicons name={(NOTIF_ICON[n.type] ?? "notifications-outline") as any} size={20} color={colors.primary} /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.title}>{n.title}</Text>
              <Text style={{ color: colors.textSoft }}>{n.message}</Text>
              <Text style={s.date}>{dateBR(n.createdAt)}</Text>
            </View>
            {!n.read && <View style={s.dot} />}
          </Pressable>
        )}
      />
    </>
  );
}
const s = StyleSheet.create({
  card: { flexDirection: "row", gap: 12, backgroundColor: "#fff", padding: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  unread: { borderColor: colors.gold },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  title: { fontWeight: "700", color: colors.text }, date: { fontSize: 11, color: colors.muted },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
