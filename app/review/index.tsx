import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { Button, colors, Input } from "../../src/ui";

export default function Review() {
  const { orderId, productId, name } = useLocalSearchParams<{ orderId: string; productId: string; name: string }>();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    try {
      const form = new FormData();
      form.append("rating", String(rating));
      if (comment.trim()) form.append("comment", comment.trim());
      await api(`/orders/${orderId}/products/${productId}/reviews`, { method: "POST", form });
      Alert.alert("Obrigada!", "Sua avaliação foi enviada.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) { Alert.alert("Não foi possível avaliar", e.message); } finally { setBusy(false); }
  };

  return (
    <View style={s.c}>
      <Text style={s.name}>{name}</Text>
      <View style={s.stars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Pressable key={i} onPress={() => setRating(i)} hitSlop={6}><Ionicons name={i <= rating ? "star" : "star-outline"} size={38} color={colors.warning} /></Pressable>
        ))}
      </View>
      <Input placeholder="Conte como foi a sua experiência (opcional)" multiline value={comment} onChangeText={setComment} style={{ minHeight: 110, textAlignVertical: "top" }} autoCapitalize="sentences" />
      <Button title={busy ? "Enviando…" : "Enviar avaliação"} onPress={send} disabled={busy} />
    </View>
  );
}
const s = StyleSheet.create({ c: { flex: 1, padding: 20, gap: 16, backgroundColor: colors.bg }, name: { fontSize: 18, fontWeight: "800", color: colors.text }, stars: { flexDirection: "row", gap: 8, justifyContent: "center", paddingVertical: 8 } });
