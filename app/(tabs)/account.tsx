import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth";
import { Button, colors } from "../../src/ui";

export default function Account() {
  const router = useRouter();
  const { user, logout } = useAuth();
  return (
    <View style={s.container}>
      {user ? (
        <>
          <Text style={s.name}>{user.fullName}</Text>
          <Text style={{ color: colors.muted, marginBottom: 16 }}>{user.email}</Text>
          <Button title="Sair" variant="outline" onPress={logout} />
        </>
      ) : (
        <>
          <Text style={{ color: colors.muted, marginBottom: 8 }}>Você não está conectado.</Text>
          <Button title="Entrar" onPress={() => router.push("/login")} />
          <View style={{ height: 8 }} />
          <Button title="Criar conta" variant="outline" onPress={() => router.push("/register")} />
        </>
      )}
    </View>
  );
}
const s = StyleSheet.create({ container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: colors.bg }, name: { fontSize: 22, fontWeight: "700" } });
