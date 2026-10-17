import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/auth";
import { Button, colors, Input } from "../src/ui";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try { await login(email.trim(), password); router.back(); }
    catch (e: any) { Alert.alert("Não foi possível entrar", e.message); }
    finally { setBusy(false); }
  };
  return (
    <View style={s.c}>
      <Text style={s.brand}>PointClick</Text>
      <Text style={s.sub}>Entre na sua conta para continuar.</Text>
      <Input placeholder="E-mail" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title={busy ? "Entrando…" : "Entrar"} onPress={submit} disabled={busy || !email || !password} />
      <Text style={s.link} onPress={() => router.replace("/register")}>Ainda não tem conta? <Text style={{ fontWeight: "800" }}>Criar conta</Text></Text>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, padding: 24, gap: 12, backgroundColor: colors.bg, justifyContent: "center" },
  brand: { fontSize: 34, fontWeight: "800", color: colors.primary, textAlign: "center" },
  sub: { color: colors.muted, textAlign: "center", marginBottom: 8 },
  link: { color: colors.primary, textAlign: "center", marginTop: 8 },
});
