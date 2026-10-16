import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api, imgUrl, money } from "../../src/api";
import { useAuth } from "../../src/auth";
import { useCart } from "../../src/cart";
import { Product } from "../../src/types";
import { Button, colors } from "../../src/ui";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { add } = useCart();
  const [p, setP] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api<Product>(`/products/${id}`, { auth: false }).then(setP).catch((e) => Alert.alert("Erro", e.message)); }, [id]);
  if (!p) return <ActivityIndicator style={{ marginTop: 40 }} />;

  const onAdd = async () => {
    if (!user) return router.push("/login");
    setBusy(true);
    try { await add(p.id, 1); Alert.alert("Pronto", "Produto adicionado ao carrinho."); }
    catch (e: any) { Alert.alert("Erro", e.message); }
    finally { setBusy(false); }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 8 }}>
      {imgUrl(p.imageUrl) && <Image source={{ uri: imgUrl(p.imageUrl)! }} style={s.img} resizeMode="contain" />}
      <Text style={s.brand}>{p.brand} · {p.category}</Text>
      <Text style={s.name}>{p.name}</Text>
      <Text style={s.price}>{money(p.price)}</Text>
      <Text style={{ color: colors.muted }}>★ {p.averageRating.toFixed(1)} ({p.reviewCount} avaliações)</Text>
      <Text style={{ color: colors.text, marginVertical: 8 }}>{p.description}</Text>
      <View>
        <Button title={p.outOfStock ? "Sem estoque" : "Adicionar ao carrinho"} onPress={onAdd} disabled={p.outOfStock || busy} />
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  img: { width: "100%", height: 260, backgroundColor: "#fff", borderRadius: 12 },
  brand: { color: colors.muted }, name: { fontSize: 22, fontWeight: "700", color: colors.text },
  price: { fontSize: 26, fontWeight: "800", color: colors.primary },
});
