import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { api, imgUrl, money } from "../../src/api";
import { Product } from "../../src/types";
import { colors, Input } from "../../src/ui";

export default function Catalog() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true); setError("");
      const q = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
      api<Product[]>(`/products?sort=newest${q}`, { auth: false })
        .then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <View style={s.container}>
      <Input placeholder="Buscar produtos…" value={search} onChangeText={setSearch} style={{ margin: 12 }} />
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} /> : error ? <Text style={s.err}>{error}</Text> : (
        <FlatList
          data={items} keyExtractor={(p) => String(p.id)} numColumns={2}
          contentContainerStyle={{ padding: 8 }} columnWrapperStyle={{ gap: 8 }}
          ListEmptyComponent={<Text style={s.err}>Nenhum produto encontrado.</Text>}
          renderItem={({ item: p }) => (
            <Pressable style={s.card} onPress={() => router.push(`/product/${p.id}`)}>
              {imgUrl(p.imageUrl) ? <Image source={{ uri: imgUrl(p.imageUrl)! }} style={s.img} resizeMode="contain" /> : <View style={[s.img, { backgroundColor: colors.border }]} />}
              <Text numberOfLines={2} style={s.name}>{p.name}</Text>
              <Text style={s.price}>{money(p.price)}</Text>
              {p.outOfStock && <Text style={{ color: colors.danger, fontSize: 12 }}>Sem estoque</Text>}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  card: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  img: { width: "100%", height: 120, borderRadius: 8, marginBottom: 8 },
  name: { fontWeight: "600", color: colors.text },
  price: { color: colors.primary, fontWeight: "700", marginTop: 4, fontSize: 16 },
  err: { textAlign: "center", marginTop: 40, color: colors.muted },
});
