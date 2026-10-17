import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { ProductCard } from "../../src/ProductCard";
import { Product } from "../../src/types";
import { colors, Empty, Input } from "../../src/ui";

const SORTS = [["recent", "Recentes"], ["low", "Menor preço"], ["high", "Maior preço"]] as const;

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<Product[]>([]);
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<string>("recent");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const q = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
    try { setItems(await api<Product[]>(`/products?sort=newest${q}`, { auth: false })); }
    catch (e: any) { setError(e.message); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => { setLoading(true); load().finally(() => setLoading(false)); }, 350);
    return () => clearTimeout(t);
  }, [load]);

  const cats = useMemo(() => Array.from(new Set(items.map((p) => p.category).filter(Boolean))), [items]);
  const shown = useMemo(() => {
    const list = cat ? items.filter((p) => p.category === cat) : [...items];
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    return list;
  }, [items, cat, sort]);

  const header = (
    <View style={{ gap: 12, paddingBottom: 8 }}>
      <View style={s.searchWrap}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <Input placeholder="Buscar produtos" value={search} onChangeText={setSearch} style={s.search} />
      </View>
      {cats.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {[null, ...cats].map((c) => (
            <Pressable key={c ?? "all"} onPress={() => setCat(c)} style={[s.chip, cat === c && s.chipOn]}>
              <Text style={[s.chipText, cat === c && { color: "#fff" }]}>{c ?? "Todos"}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <View style={s.sortRow}>
        <Text style={s.count}>{shown.length} {shown.length === 1 ? "produto" : "produtos"}</Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {SORTS.map(([k, label]) => (
            <Pressable key={k} onPress={() => setSort(k)}><Text style={[s.sort, sort === k && s.sortOn]}>{label}</Text></Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  if (loading && items.length === 0) return <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} />;
  return (
    <FlatList
      style={{ backgroundColor: colors.bg }} data={shown} keyExtractor={(p) => String(p.id)} numColumns={2}
      ListHeaderComponent={header} contentContainerStyle={{ padding: 12 }} columnWrapperStyle={{ gap: 12 }}
      refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
      ListEmptyComponent={error ? <Empty icon="cloud-offline-outline" text={`${error}\nPuxe para baixo para tentar de novo.`} /> : <Empty icon="search-outline" text="Nenhum produto encontrado." />}
      renderItem={({ item }) => <ProductCard p={item} />}
    />
  );
}
const s = StyleSheet.create({
  searchWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingLeft: 14 },
  search: { flex: 1, borderWidth: 0, backgroundColor: "transparent" },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontWeight: "600", color: colors.textSoft },
  sortRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  count: { color: colors.muted, fontSize: 12 },
  sort: { fontSize: 12, color: colors.muted, paddingHorizontal: 6, paddingVertical: 2 },
  sortOn: { color: colors.primary, fontWeight: "800" },
});
