import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "../src/api";
import { Address, Me, Quote } from "../src/types";
import { Button, colors, Input } from "../src/ui";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [a, setA] = useState<Address>({ cep: "", street: "", number: "", complement: "", city: "", state: "" });
  const set = (k: keyof Address) => (v: string) => setA((x) => ({ ...x, [k]: k === "state" ? v.toUpperCase().slice(0, 2) : v }));

  useEffect(() => {
    api<Me>("/users/me").then((m) => {
      setEmail(m.email); setName(m.fullName); setCpf(m.cpf ?? ""); setPhone(m.phone ?? "");
      if (m.address) setA({ ...m.address, complement: m.address.complement ?? "" });
    }).catch((e) => Alert.alert("Erro", e.message)).finally(() => setLoading(false));
  }, []);

  const lookupCep = async (v: string) => {
    set("cep")(v);
    const d = v.replace(/\D/g, "");
    if (d.length !== 8) return;
    try {
      const q = await api<Quote>(`/shipping/quote?cep=${d}`);
      setA((x) => ({ ...x, cep: d, street: x.street || q.street || "", city: x.city || q.city || "", state: x.state || q.state || "" }));
    } catch {}
  };

  const save = async () => {
    setBusy(true);
    try {
      const profile: Record<string, string> = { fullName: fullName.trim() };
      if (cpf.trim()) profile.cpf = cpf.replace(/\D/g, "");
      if (phone.trim()) profile.phone = phone.replace(/\D/g, "");
      await api("/users/me/profile", { method: "PATCH", body: profile });
      if (a.cep || a.street || a.number || a.city || a.state) {
        if (!a.cep || !a.street || !a.number || !a.city || a.state.length !== 2) throw new Error("Endereço incompleto: preencha CEP, rua, número, cidade e UF.");
        await api("/users/me/address", { method: "PUT", body: { ...a, cep: a.cep.replace(/\D/g, ""), complement: a.complement || null } });
      }
      Alert.alert("Pronto", "Seus dados foram salvos.");
    } catch (e: any) { Alert.alert("Não foi possível salvar", e.message); } finally { setBusy(false); }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;
  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 10 }} keyboardShouldPersistTaps="handled">
      <Text style={s.h}>Dados pessoais</Text>
      <Input placeholder="Nome completo" autoCapitalize="words" value={fullName} onChangeText={setName} />
      <Input placeholder="E-mail" value={email} editable={false} style={{ opacity: 0.6 }} />
      <Input placeholder="CPF (somente números)" keyboardType="number-pad" maxLength={14} value={cpf} onChangeText={setCpf} />
      <Input placeholder="Telefone com DDD" keyboardType="phone-pad" maxLength={15} value={phone} onChangeText={setPhone} />
      <Text style={s.h}>Endereço de entrega</Text>
      <Input placeholder="CEP" keyboardType="number-pad" maxLength={9} value={a.cep} onChangeText={lookupCep} />
      <Input placeholder="Rua" autoCapitalize="words" value={a.street} onChangeText={set("street")} />
      <View style={s.row}>
        <Input placeholder="Número" value={a.number} onChangeText={set("number")} style={{ flex: 1 }} />
        <Input placeholder="Complemento" value={a.complement ?? ""} onChangeText={set("complement")} style={{ flex: 2 }} />
      </View>
      <View style={s.row}>
        <Input placeholder="Cidade" autoCapitalize="words" value={a.city} onChangeText={set("city")} style={{ flex: 3 }} />
        <Input placeholder="UF" autoCapitalize="characters" value={a.state} onChangeText={set("state")} style={{ flex: 1 }} />
      </View>
      <Button title={busy ? "Salvando…" : "Salvar"} onPress={save} disabled={busy || !fullName.trim()} />
    </ScrollView>
  );
}
const s = StyleSheet.create({ h: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 8 }, row: { flexDirection: "row", gap: 8 } });
