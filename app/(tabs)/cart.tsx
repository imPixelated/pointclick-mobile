import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { imgUrl, money } from "../../src/api";
import { useAuth } from "../../src/auth";
import { useCart } from "../../src/cart";
import { Button, colors } from "../../src/ui";

export default function Cart() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, setQty, remove } = useCart();

  if (!user) return <View style={s.center}><Text style={s.muted}>Entre para ver seu carrinho.</Text><Button title="Entrar" onPress={() => router.push("/login")} /></View>;
  if (!cart || cart.items.length === 0) return <View style={s.center}><Text style={s.muted}>Seu carrinho está vazio.</Text></View>;

  const run = (fn: () => Promise<void>) => fn().catch((e) => Alert.alert("Erro", e.message));
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={cart.items} keyExtractor={(i) => String(i.id)} contentContainerStyle={{ padding: 12, gap: 8 }}
        renderItem={({ item: i }) => (
          <View style={s.row}>
            {imgUrl(i.productImageUrl) && <Image source={{ uri: imgUrl(i.productImageUrl)! }} style={s.thumb} />}
            <View style={{ flex: 1 }}>
              <Text numberOfLines={2} style={{ fontWeight: "600" }}>{i.productName}</Text>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>{money(i.subtotal)}</Text>
              <View style={s.qty}>
                <Pressable style={s.qbtn} onPress={() => run(() => (i.quantity > 1 ? setQty(i.id, i.quantity - 1) : remove(i.id)))}><Text>−</Text></Pressable>
                <Text style={{ minWidth: 24, textAlign: "center" }}>{i.quantity}</Text>
                <Pressable style={s.qbtn} onPress={() => run(() => setQty(i.id, i.quantity + 1))}><Text>+</Text></Pressable>
                <Pressable onPress={() => run(() => remove(i.id))}><Text style={{ color: colors.danger, marginLeft: 12 }}>Remover</Text></Pressable>
              </View>
            </View>
          </View>
        )}
      />
      <View style={s.footer}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Total: {money(cart.itemsAmount)}</Text>
        <Button title="Finalizar compra" onPress={() => router.push("/checkout")} />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  muted: { color: colors.muted },
  row: { flexDirection: "row", gap: 12, backgroundColor: colors.card, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  thumb: { width: 72, height: 72, borderRadius: 8 },
  qty: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  qbtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  footer: { padding: 16, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, gap: 4 },
});
