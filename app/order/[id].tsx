import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { api, imgUrl, money } from "../../src/api";
import { Order, STATUS, STATUS_COLOR } from "../../src/types";
import { Button, Chip, colors, dateBR } from "../../src/ui";

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

  if (!o) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View><Text style={s.h}>Pedido #{o.id}</Text>{o.orderDate ? <Text style={s.muted}>{dateBR(o.orderDate)}</Text> : null}</View>
        <Chip label={STATUS[o.status] ?? o.status} color={STATUS_COLOR[o.status] ?? colors.muted} />
      </View>

      {o.items.map((i) => (
        <View key={i.id} style={s.item}>
          <View style={s.thumbBox}>{imgUrl(i.productImageUrl) ? <Image source={{ uri: imgUrl(i.productImageUrl)! }} style={s.thumb} resizeMode="contain" /> : null}</View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text numberOfLines={2} style={{ fontWeight: "600", color: colors.text }}>{i.productName}</Text>
            <Text style={s.muted}>{i.quantity}× {money(i.unitPriceAtMoment)}</Text>
            {o.status === "FINISHED" && (
              <Text style={s.link} onPress={() => router.push({ pathname: "/review", params: { orderId: String(o.id), productId: String(i.productId), name: i.productName } })}>Avaliar produto</Text>
            )}
          </View>
          <Text style={{ fontWeight: "700" }}>{money(i.subtotal)}</Text>
        </View>
      ))}

      <View style={s.box}>
        <View style={s.line}><Text style={s.muted}>Itens</Text><Text>{money(o.itemsAmount)}</Text></View>
        {o.discountAmount > 0 && <View style={s.line}><Text style={s.muted}>Desconto{o.couponCode ? ` (${o.couponCode})` : ""}</Text><Text style={{ color: colors.teal }}>- {money(o.discountAmount)}</Text></View>}
        <View style={s.line}><Text style={s.muted}>Frete</Text><Text>{money(o.freightAmount ?? 0)}</Text></View>
        <View style={s.line}><Text style={s.total}>Total</Text><Text style={s.total}>{money(o.totalAmount)}</Text></View>
      </View>
      {o.deliveryAddress ? <View style={s.box}><Text style={s.muted}>Entrega em</Text><Text style={{ color: colors.text }}>{o.deliveryAddress}</Text></View> : null}

      {o.status === "CLOSED" && (<><Button title="Pagar agora" onPress={() => router.push(`/payment/${o.id}`)} /><Button title="Cancelar pedido" variant="outline" onPress={cancel} /></>)}
      {o.status === "DELIVERED" && <Button title="Confirmar recebimento" onPress={act("confirm-delivery", "Recebimento confirmado!")} />}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 22, fontWeight: "800", color: colors.text }, muted: { color: colors.muted, fontSize: 13 },
  item: { flexDirection: "row", gap: 12, backgroundColor: "#fff", padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  thumbBox: { width: 60, height: 60, borderRadius: 12, backgroundColor: colors.imageBg, padding: 4 }, thumb: { width: "100%", height: "100%" },
  link: { color: colors.primary, fontWeight: "700" },
  box: { backgroundColor: "#fff", padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, gap: 6 },
  line: { flexDirection: "row", justifyContent: "space-between" }, total: { fontSize: 18, fontWeight: "800", color: colors.text },
});
