import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { api, money } from "../../src/api";
import { Order, STATUS } from "../../src/types";
import { Button, colors } from "../../src/ui";

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [o, setO] = useState<Order | null>(null);
  const load = useCallback(() => { api<Order>(`/orders/${id}`).then(setO).catch((e) => Alert.alert("Erro", e.message)); }, [id]);
  useFocusEffect(load);

  const act = (path: string, ok: string) => async () => {
    try { setO(await api<Order>(`/orders/${id}/${path}`, { method: "POST" })); Alert.alert("Pronto", ok); }
    catch (e: any) { Alert.alert("Erro", e.message); }
  };
  const cancel = () => Alert.alert("Cancelar pedido", "Tem certeza?", [{ text: "Não" }, { text: "Cancelar pedido", style: "destructive", onPress: act("cancel", "Pedido cancelado.") }]);

  if (!o) return <ActivityIndicator style={{ marginTop: 40 }} />;
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Text style={s.h}>Pedido #{o.id}</Text>
      <Text style={s.status}>{STATUS[o.status] ?? o.status}</Text>
      {o.items.map((i) => (
        <View key={i.id} style={s.item}>
          <Text style={{ flex: 1 }}>{i.quantity}× {i.productName}</Text><Text style={{ fontWeight: "600" }}>{money(i.subtotal)}</Text>
        </View>
      ))}
      <View style={s.box}>
        <Text>Itens: {money(o.itemsAmount)}</Text>
        {o.discountAmount > 0 && <Text>Desconto{o.couponCode ? ` (${o.couponCode})` : ""}: - {money(o.discountAmount)}</Text>}
        <Text>Frete: {money(o.freightAmount ?? 0)}</Text>
        <Text style={{ fontWeight: "800", fontSize: 18 }}>Total: {money(o.totalAmount)}</Text>
      </View>
      {o.deliveryAddress ? <Text style={{ color: colors.muted }}>Entrega: {o.deliveryAddress}</Text> : null}
      {o.status === "CLOSED" && (<><Button title="Pagar agora" onPress={() => router.push(`/payment/${o.id}`)} /><Button title="Cancelar pedido" variant="outline" onPress={cancel} /></>)}
      {o.status === "DELIVERED" && <Button title="Confirmar recebimento" onPress={act("confirm-delivery", "Recebimento confirmado!")} />}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 22, fontWeight: "800" }, status: { color: colors.primary, fontWeight: "700" },
  item: { flexDirection: "row", gap: 8, backgroundColor: colors.card, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  box: { backgroundColor: colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, gap: 2 },
});
