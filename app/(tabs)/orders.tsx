import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { api, money } from "../../src/api";
import { useAuth } from "../../src/auth";
import { OrderSummary, STATUS } from "../../src/types";
import { Button, colors } from "../../src/ui";

export default function Orders() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  useFocusEffect(useCallback(() => {
    if (user) api<OrderSummary[]>("/orders/my").then((o) => setOrders(o.filter((x) => x.status !== "PENDING"))).catch(() => {});
  }, [user]));

  if (!user) return <View style={s.center}><Text style={{ color: colors.muted }}>Entre para ver seus pedidos.</Text><Button title="Entrar" onPress={() => router.push("/login")} /></View>;
  return (
    <FlatList
      style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 12, gap: 8 }}
      data={orders} keyExtractor={(o) => String(o.id)}
      ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 40, color: colors.muted }}>Nenhum pedido ainda.</Text>}
      renderItem={({ item: o }) => (
        <Pressable style={s.card} onPress={() => router.push(`/order/${o.id}`)}>
          <Text style={{ fontWeight: "700" }}>Pedido #{o.id}</Text>
          <Text style={{ color: colors.muted }}>{new Date(o.orderDate).toLocaleDateString("pt-BR")} · {STATUS[o.status] ?? o.status}</Text>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>{money(o.totalAmount)}</Text>
        </Pressable>
      )}
    />
  );
}
const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  card: { backgroundColor: colors.card, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, gap: 2 },
});
