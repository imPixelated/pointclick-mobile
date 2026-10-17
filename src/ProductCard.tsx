import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { imgUrl, money } from "./api";
import { useAuth } from "./auth";
import { useCart } from "./cart";
import { useFavorites } from "./favorites";
import { Product } from "./types";
import { colors } from "./ui";

export function ProductCard({ p }: { p: Product }) {
  const router = useRouter();
  const { user } = useAuth();
  const { add } = useCart();
  const { isFav, toggle } = useFavorites();
  const [added, setAdded] = useState(false);
  const unavailable = p.outOfStock || p.availableQuantity <= 0 || p.active === false;
  const fav = isFav(p.id);

  const onAdd = async () => {
    if (!user) return router.push("/login");
    try { await add(p.id, 1); setAdded(true); setTimeout(() => setAdded(false), 1400); } catch (e: any) { Alert.alert("Erro", e.message); }
  };
  const onFav = async () => {
    if (!user) return router.push("/login");
    try { await toggle(p.id); } catch (e: any) { Alert.alert("Erro", e.message); }
  };

  return (
    <Pressable style={s.card} onPress={() => router.push(`/product/${p.id}`)}>
      <View style={s.imgBox}>
        {imgUrl(p.imageUrl) ? <Image source={{ uri: imgUrl(p.imageUrl)! }} style={s.img} resizeMode="contain" /> : <Ionicons name="laptop-outline" size={40} color={colors.muted} />}
        {unavailable ? <Text style={[s.badge, { color: colors.danger }]}>Indisponível</Text>
          : p.lowStock ? <Text style={[s.badge, { color: colors.warning }]}>Últimas unidades</Text> : null}
        <Pressable onPress={onFav} hitSlop={8} style={s.heart}>
          <Ionicons name={fav ? "heart" : "heart-outline"} size={18} color={fav ? colors.primary : colors.muted} />
        </Pressable>
      </View>
      <View style={s.body}>
        <View style={s.brandRow}>
          <Text numberOfLines={1} style={s.brand}>{p.brand}</Text>
          {p.reviewCount > 0 && <Text style={s.rating}><Ionicons name="star" size={11} color={colors.warning} /> {p.averageRating.toFixed(1)}</Text>}
        </View>
        <Text numberOfLines={2} style={s.name}>{p.name}</Text>
        <Text style={s.price}>{money(p.price)}</Text>
        <Pressable disabled={unavailable} onPress={onAdd} style={[s.add, unavailable && { opacity: 0.45 }]}>
          <Ionicons name={added ? "checkmark" : "cart-outline"} size={16} color={colors.primary} />
          <Text style={s.addText}>{unavailable ? "Indisponível" : added ? "Adicionado" : "Adicionar"}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
const s = StyleSheet.create({
  card: { flex: 1, backgroundColor: "#fff", borderRadius: 22, borderWidth: 1, borderColor: colors.border, marginBottom: 12, overflow: "hidden" },
  imgBox: { height: 150, backgroundColor: colors.imageBg, alignItems: "center", justifyContent: "center", padding: 14 },
  img: { width: "100%", height: "100%" },
  badge: { position: "absolute", top: 10, left: 10, backgroundColor: "#fff", borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9, fontSize: 11, fontWeight: "700", overflow: "hidden" },
  heart: { position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  body: { padding: 12, gap: 4 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { flex: 1, fontSize: 10, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase", color: colors.muted },
  rating: { fontSize: 11, fontWeight: "700", color: colors.textSoft },
  name: { fontSize: 14, fontWeight: "600", color: colors.text, minHeight: 36 },
  price: { fontSize: 18, fontWeight: "700", color: colors.text, marginVertical: 4 },
  add: { flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 999, backgroundColor: colors.primarySoft },
  addText: { color: colors.primary, fontWeight: "700", fontSize: 13 },
});
