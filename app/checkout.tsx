import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { api, money } from "../src/api";
import { useAuth } from "../src/auth";
import { useCart } from "../src/cart";
import { Address, Me, Order, Quote } from "../src/types";
import { Button, colors, Input } from "../src/ui";

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, reload } = useCart();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [a, setA] = useState<Address>({ cep: "", street: "", number: "", complement: "", city: "", state: "" });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [coupon, setCoupon] = useState("");

  const set = (k: keyof Address) => (v: string) => setA((x) => ({ ...x, [k]: k === "state" ? v.toUpperCase().slice(0, 2) : v }));

  useEffect(() => {
    if (!user) return;
    api<Me>("/users/me").then((m) => { if (m.address) { setA({ ...m.address, complement: m.address.complement ?? "" }); getQuote(m.address.cep); } })
      .catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  async function getQuote(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const q = await api<Quote>(`/shipping/quote?cep=${digits}`);
      setQuote(q);
      setA((x) => ({ ...x, cep: digits, street: x.street || q.street || "", city: x.city || q.city || "", state: x.state || q.state || "" }));
    } catch (e: any) { setQuote(null); Alert.alert("CEP", e.message); }
  }

  const run = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); } catch (e: any) { Alert.alert("Erro", e.message); } finally { setBusy(false); } };
  const applyCoupon = () => run(async () => { await api<Order>(`/orders/${cart!.id}/coupon`, { method: "POST", body: { code: coupon.trim() } }); await reload(); setCoupon(""); });
  const removeCoupon = () => run(async () => { await api(`/orders/${cart!.id}/coupon`, { method: "DELETE" }); await reload(); });

  const finish = () => run(async () => {
    if (!a.cep || !a.street || !a.number || !a.city || a.state.length !== 2) throw new Error("Preencha CEP, rua, número, cidade e UF (2 letras).");
    await api("/users/me/address", { method: "PUT", body: { ...a, cep: a.cep.replace(/\D/g, ""), complement: a.complement || null } });
    const closed = await api<Order>(`/orders/${cart!.id}/close`, { method: "POST" });
    await reload();
    router.replace(`/payment/${closed.id}`);
  });

  if (!user) return <View style={s.center}><Text>Entre para continuar.</Text><Button title="Entrar" onPress={() => router.push("/login")} /></View>;
  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!cart || cart.items.length === 0) return <View style={s.center}><Text>Seu carrinho está vazio.</Text></View>;

  const total = cart.itemsAmount - (cart.discountAmount ?? 0) + (quote?.shippingPrice ?? 0);
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 10 }} keyboardShouldPersistTaps="handled">
      <Text style={s.h}>Endereço de entrega</Text>
      <Input placeholder="CEP (somente números)" keyboardType="number-pad" maxLength={9} value={a.cep} onChangeText={(v) => { set("cep")(v); getQuote(v); }} />
      <Input placeholder="Rua" value={a.street} onChangeText={set("street")} autoCapitalize="words" />
      <View style={s.row}>
        <Input placeholder="Número" value={a.number} onChangeText={set("number")} style={{ flex: 1 }} />
        <Input placeholder="Complemento" value={a.complement ?? ""} onChangeText={set("complement")} style={{ flex: 2 }} />
      </View>
      <View style={s.row}>
        <Input placeholder="Cidade" value={a.city} onChangeText={set("city")} autoCapitalize="words" style={{ flex: 3 }} />
        <Input placeholder="UF" value={a.state} onChangeText={set("state")} autoCapitalize="characters" style={{ flex: 1 }} />
      </View>

      <Text style={s.h}>Cupom</Text>
      {cart.couponCode ? (
        <View style={s.row}><Text style={{ flex: 1 }}>Cupom aplicado: <Text style={{ fontWeight: "700" }}>{cart.couponCode}</Text></Text><Button title="Remover" variant="outline" onPress={removeCoupon} disabled={busy} /></View>
      ) : (
        <View style={s.row}><Input placeholder="Código do cupom" value={coupon} onChangeText={setCoupon} autoCapitalize="characters" style={{ flex: 1 }} /><Button title="Aplicar" onPress={applyCoupon} disabled={busy || !coupon.trim()} /></View>
      )}

      <Text style={s.h}>Resumo</Text>
      <View style={s.box}>
        <Line l="Itens" v={money(cart.itemsAmount)} />
        {cart.discountAmount > 0 && <Line l="Desconto" v={`- ${money(cart.discountAmount)}`} />}
        <Line l="Frete" v={quote ? `${money(quote.shippingPrice)} (${quote.estimatedDays} dias)` : "informe o CEP"} />
        <Line l="Total estimado" v={money(total)} bold />
      </View>
      <Text style={{ color: colors.muted, fontSize: 12 }}>O frete final é calculado ao fechar o pedido. O estoque fica reservado até o pagamento.</Text>
      <Button title={busy ? "Processando…" : "Fechar pedido e pagar"} onPress={finish} disabled={busy} />
    </ScrollView>
  );
}
const Line = ({ l, v, bold }: { l: string; v: string; bold?: boolean }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
    <Text style={{ fontWeight: bold ? "800" : "400" }}>{l}</Text><Text style={{ fontWeight: bold ? "800" : "600" }}>{v}</Text>
  </View>
);
const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  h: { fontSize: 16, fontWeight: "700", marginTop: 8, color: colors.text },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  box: { backgroundColor: colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
});
