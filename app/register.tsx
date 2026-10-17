import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/auth";
import { Button, colors, Input } from "../src/ui";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (password.length < 6) return Alert.alert("Senha curta", "Use pelo menos 6 caracteres.");
    setBusy(true);
    try { await register(fullName.trim(), email.trim(), password); router.back(); }
    catch (e: any) { Alert.alert("Não foi possível cadastrar", e.message); }
    finally { setBusy(false); }
  };
  return (
    <View style={s.c}>
      <Text style={s.brand}>PointClick</Text>
      <Text style={s.sub}>Crie sua conta em poucos segundos.</Text>
      <Input placeholder="Nome completo" autoCapitalize="words" value={fullName} onChangeText={setName} />
      <Input placeholder="E-mail" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input placeholder="Senha (mínimo 6 caracteres)" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title={busy ? "Criando…" : "Criar conta"} onPress={submit} disabled={busy || !fullName || !email || !password} />
      <Text style={s.link} onPress={() => router.replace("/login")}>Já tem conta? <Text style={{ fontWeight: "800" }}>Entrar</Text></Text>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, padding: 24, gap: 12, backgroundColor: colors.bg, justifyContent: "center" },
  brand: { fontSize: 34, fontWeight: "800", color: colors.primary, textAlign: "center" },
  sub: { color: colors.muted, textAlign: "center", marginBottom: 8 },
  link: { color: colors.primary, textAlign: "center", marginTop: 8 },
});
