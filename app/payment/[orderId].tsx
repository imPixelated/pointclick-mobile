import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api, ApiError, money } from "../../src/api";
import { Order, Payment } from "../../src/types";
import { Button, colors, Input } from "../../src/ui";

const METHODS = [["PIX", "PIX"], ["CREDIT_CARD", "Cartão de crédito"], ["DEBIT_CARD", "Cartão de débito"], ["BANK_SLIP", "Boleto"]] as const;

export default function PaymentScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [method, setMethod] = useState<string>("PIX");
  const [card, setCard] = useState({ number: "", holder: "", exp: "", cvv: "" });
  const [installments, setInstallments] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Order>(`/orders/${orderId}`).then(setOrder).catch((e) => Alert.alert("Erro", e.message));
    api<Payment>(`/payments/orders/${orderId}`).then(setPayment).catch(() => {});
  }, [orderId]);

  const done = () => Alert.alert("Pagamento aprovado", "Seu pedido foi pago!", [{ text: "OK", onPress: () => router.replace("/(tabs)/orders") }]);
  const isCard = method === "CREDIT_CARD" || method === "DEBIT_CARD";

  const pay = async () => {
    setBusy(true);
    try {
      const body: any = { paymentMethod: method };
      if (isCard) Object.assign(body, { cardNumber: card.number.replace(/\s/g, ""), cardHolderName: card.holder, expirationDate: card.exp, cvv: card.cvv, installments: method === "CREDIT_CARD" ? installments : 1 });
      const p = await api<Payment>(`/payments/orders/${orderId}`, { method: "POST", body });
      setPayment(p);
      if (p.status === "APPROVED") done();
    } catch (e: any) { Alert.alert("Pagamento", e.message); } finally { setBusy(false); }
  };

  const refresh = async () => {
    try {
      const p = await api<Payment>(`/payments/orders/${orderId}`);
      setPayment(p);
      if (p.status === "APPROVED") done(); else Alert.alert("Pagamento", "Ainda aguardando a confirmação.");
    } catch (e: any) { Alert.alert("Erro", e instanceof ApiError ? e.message : "Falha ao consultar"); }
  };

  if (!order) return <ActivityIndicator style={{ marginTop: 40 }} />;
  const pending = payment && payment.status === "PENDING" && (payment.method === "PIX" || payment.method === "BANK_SLIP");

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 10 }} keyboardShouldPersistTaps="handled">
      <Text style={s.total}>Total: {money(order.totalAmount)}</Text>

      {pending ? (
        <View style={s.box}>
          <Text style={{ fontWeight: "700" }}>{payment!.method === "PIX" ? "Pagamento via PIX" : "Boleto gerado"}</Text>
          <Text selectable style={s.code}>{payment!.method === "PIX" ? payment!.pixCode : payment!.digitableLine ?? payment!.bankSlipBarCode}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Pagamento simulado: abra a página de confirmação, confirme e volte para verificar.</Text>
          <Button title="Abrir página de confirmação" onPress={() => Linking.openURL((payment!.method === "PIX" ? payment!.pixConfirmationUrl : payment!.bankSlipConfirmationUrl)!)} />
          <Button title="Já paguei, verificar" variant="outline" onPress={refresh} />
        </View>
      ) : payment?.status === "APPROVED" ? (
        <View style={s.box}><Text style={{ fontWeight: "700" }}>Pagamento aprovado ✅</Text><Button title="Ver meus pedidos" onPress={() => router.replace("/(tabs)/orders")} /></View>
      ) : (
        <>
          {METHODS.map(([k, label]) => (
            <Pressable key={k} onPress={() => setMethod(k)} style={[s.opt, method === k && s.optOn]}>
              <Text style={{ fontWeight: method === k ? "700" : "400" }}>{method === k ? "● " : "○ "}{label}</Text>
            </Pressable>
          ))}
          {isCard && (
            <View style={{ gap: 8 }}>
              <Input placeholder="Número do cartão" keyboardType="number-pad" maxLength={19} value={card.number} onChangeText={(v) => setCard({ ...card, number: v })} />
              <Input placeholder="Nome no cartão" autoCapitalize="characters" value={card.holder} onChangeText={(v) => setCard({ ...card, holder: v })} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Input placeholder="MM/AA" maxLength={5} value={card.exp} onChangeText={(v) => setCard({ ...card, exp: v.length === 2 && !v.includes("/") && card.exp.length < 2 ? v + "/" : v })} style={{ flex: 1 }} />
                <Input placeholder="CVV" keyboardType="number-pad" maxLength={4} secureTextEntry value={card.cvv} onChangeText={(v) => setCard({ ...card, cvv: v })} style={{ flex: 1 }} />
              </View>
              {method === "CREDIT_CARD" && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Text>Parcelas: {installments}x de {money(order.totalAmount / installments)}</Text>
                  <Button title="−" variant="outline" onPress={() => setInstallments((n) => Math.max(1, n - 1))} />
                  <Button title="+" variant="outline" onPress={() => setInstallments((n) => Math.min(12, n + 1))} />
                </View>
              )}
            </View>
          )}
          <Button title={busy ? "Processando…" : "Pagar"} onPress={pay} disabled={busy} />
        </>
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  total: { fontSize: 22, fontWeight: "800", color: colors.primary },
  box: { backgroundColor: colors.card, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, gap: 10 },
  code: { fontFamily: "monospace", fontSize: 12, backgroundColor: colors.bg, padding: 8, borderRadius: 8 },
  opt: { padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  optOn: { borderColor: colors.primary },
});
