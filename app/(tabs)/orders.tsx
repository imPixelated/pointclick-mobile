import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api, money } from "../../src/api";
import { useAuth } from "../../src/auth";
import { OrderSummary, STATUS, STATUS_COLOR } from "../../src/types";
import { Button, Chip, colors, dateBR, Empty } from "../../src/ui";

export default function Orders() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    if (!user) return;
    try { const o = await api<OrderSummary[]>("/orders/my"); setOrders(o.filter((x) => x.status !== "PENDING").sort((a, b) => b.id - a.id)); } catch {}
  }, [user]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!user) return <Empty icon="receipt-outline" text="Entre para ver os seus pedidos." action={<Button title="Entrar" onPress={() => router.push("/login")} />} />;
  return (
    <FlatList
      style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 12, gap: 10 }}
      data={orders} keyExtractor={(o) => String(o.id)}
      refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
      ListEmptyComponent={<Empty icon="receipt-outline" text="Você ainda não fez nenhum pedido." />}
      renderItem={({ item: o }) => (
        <Pressable style={s.card} onPress={() => router.push(`/order/${o.id}`)}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.title}>Pedido #{o.id}</Text>
            <Text style={s.date}>{dateBR(o.orderDate)}</Text>
            <Chip label={STATUS[o.status] ?? o.status} color={STATUS_COLOR[o.status] ?? colors.muted} />
          </View>
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <Text style={s.total}>{money(o.totalAmount)}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </View>
        </Pressable>
      )}
    />
  );
}
const s = StyleSheet.create({
  card: { flexDirection: "row", backgroundColor: "#fff", padding: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  title: { fontWeight: "800", color: colors.text, fontSize: 16 },
  date: { color: colors.muted, fontSize: 12 },
  total: { fontWeight: "800", color: colors.text, fontSize: 16 },
});
