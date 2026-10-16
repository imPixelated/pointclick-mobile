import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
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
    setBusy(true);
    try { await register(fullName.trim(), email.trim(), password); router.back(); }
    catch (e: any) { Alert.alert("Não foi possível cadastrar", e.message); }
    finally { setBusy(false); }
  };
  return (
    <View style={s.c}>
      <Input placeholder="Nome completo" autoCapitalize="words" value={fullName} onChangeText={setName} />
      <Input placeholder="E-mail" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input placeholder="Senha" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title={busy ? "Criando…" : "Criar conta"} onPress={submit} disabled={busy || !fullName || !email || !password} />
    </View>
  );
}
const s = StyleSheet.create({ c: { flex: 1, padding: 24, gap: 12, backgroundColor: colors.bg } });
