import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
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
      <Input placeholder="E-mail" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title={busy ? "Entrando…" : "Entrar"} onPress={submit} disabled={busy || !email || !password} />
      <Button title="Criar conta" variant="outline" onPress={() => router.replace("/register")} />
    </View>
  );
}
const s = StyleSheet.create({ c: { flex: 1, padding: 24, gap: 12, backgroundColor: colors.bg } });
