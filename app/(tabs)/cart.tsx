import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { imgUrl, money } from "../../src/api";
import { useAuth } from "../../src/auth";
import { useCart } from "../../src/cart";
import { Button, colors, Empty } from "../../src/ui";

export default function Cart() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, setQty, remove, reload } = useCart();

  if (!user) return <Empty icon="cart-outline" text="Entre para ver o seu carrinho." action={<Button title="Entrar" onPress={() => router.push("/login")} />} />;
  if (!cart || cart.items.length === 0) return <Empty icon="cart-outline" text="Seu carrinho está vazio." action={<Button title="Ver produtos" onPress={() => router.push("/(tabs)")} />} />;

  const run = (fn: () => Promise<void>) => fn().catch((e) => Alert.alert("Erro", e.message));
  const units = cart.items.reduce((n, i) => n + i.quantity, 0);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={cart.items} keyExtractor={(i) => String(i.id)} contentContainerStyle={{ padding: 12, gap: 10 }}
        refreshing={false} onRefresh={() => run(reload)}
        renderItem={({ item: i }) => (
          <View style={s.row}>
            <View style={s.thumbBox}>{imgUrl(i.productImageUrl) ? <Image source={{ uri: imgUrl(i.productImageUrl)! }} style={s.thumb} resizeMode="contain" /> : <Ionicons name="image-outline" size={24} color={colors.muted} />}</View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text numberOfLines={2} style={s.name}>{i.productName}</Text>
              <Text style={s.unit}>{money(i.unitPriceAtMoment)} cada</Text>
              <View style={s.footerRow}>
                <View style={s.qty}>
                  <Pressable style={s.qbtn} onPress={() => run(() => (i.quantity > 1 ? setQty(i.id, i.quantity - 1) : remove(i.id)))}><Ionicons name="remove" size={16} color={colors.text} /></Pressable>
                  <Text style={s.qnum}>{i.quantity}</Text>
                  <Pressable style={s.qbtn} onPress={() => run(() => setQty(i.id, i.quantity + 1))}><Ionicons name="add" size={16} color={colors.text} /></Pressable>
                </View>
                <Text style={s.sub}>{money(i.subtotal)}</Text>
              </View>
            </View>
            <Pressable onPress={() => run(() => remove(i.id))} hitSlop={10}><Ionicons name="trash-outline" size={18} color={colors.danger} /></Pressable>
          </View>
        )}
      />
      <View style={s.footer}>
        <View style={s.line}><Text style={{ color: colors.muted }}>Itens ({units})</Text><Text style={{ fontWeight: "600" }}>{money(cart.itemsAmount)}</Text></View>
        <View style={s.line}><Text style={{ color: colors.muted }}>Frete</Text><Text style={{ color: colors.muted }}>calculado no checkout</Text></View>
        <View style={s.line}><Text style={s.total}>Total</Text><Text style={s.total}>{money(cart.itemsAmount)}</Text></View>
        <Button title="Finalizar compra" onPress={() => router.push("/checkout")} />
        <Pressable onPress={() => router.push("/(tabs)")}><Text style={s.more}>Continuar comprando</Text></Pressable>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, backgroundColor: "#fff", padding: 12, borderRadius: 18, borderWidth: 1, borderColor: colors.border, alignItems: "flex-start" },
  thumbBox: { width: 80, height: 80, borderRadius: 14, backgroundColor: colors.imageBg, alignItems: "center", justifyContent: "center", padding: 6 },
  thumb: { width: "100%", height: "100%" },
  name: { fontWeight: "600", color: colors.text },
  unit: { color: colors.muted, fontSize: 12 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  qty: { flexDirection: "row", alignItems: "center", backgroundColor: colors.bg, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  qbtn: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  qnum: { minWidth: 22, textAlign: "center", fontWeight: "700" },
  sub: { fontWeight: "800", color: colors.text, fontSize: 16 },
  footer: { padding: 16, gap: 8, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: colors.border },
  line: { flexDirection: "row", justifyContent: "space-between" },
  total: { fontSize: 18, fontWeight: "800", color: colors.text },
  more: { textAlign: "center", color: colors.primary, fontWeight: "700", paddingVertical: 4 },
});
