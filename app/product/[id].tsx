import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api, imgUrl, money } from "../../src/api";
import { useAuth } from "../../src/auth";
import { useCart } from "../../src/cart";
import { useFavorites } from "../../src/favorites";
import { Product, Review } from "../../src/types";
import { Button, colors, dateBR, initials, Stars } from "../../src/ui";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { add } = useCart();
  const { isFav, toggle } = useFavorites();
  const [p, setP] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Product>(`/products/${id}`, { auth: false }).then(setP).catch((e) => Alert.alert("Erro", e.message));
    api<Review[]>(`/products/${id}/reviews`, { auth: false }).then(setReviews).catch(() => {});
  }, [id]);
  if (!p) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;

  const unavailable = p.outOfStock || p.availableQuantity <= 0 || p.active === false;
  const fav = isFav(p.id);
  const onAdd = async () => {
    if (!user) return router.push("/login");
    setBusy(true);
    try { await add(p.id, 1); Alert.alert("Pronto", "Produto adicionado ao carrinho.", [{ text: "Continuar" }, { text: "Ver carrinho", onPress: () => router.push("/(tabs)/cart") }]); }
    catch (e: any) { Alert.alert("Erro", e.message); }
    finally { setBusy(false); }
  };
  const onFav = async () => {
    if (!user) return router.push("/login");
    try { await toggle(p.id); } catch (e: any) { Alert.alert("Erro", e.message); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}>
        <View style={s.imgBox}>
          {imgUrl(p.imageUrl) ? <Image source={{ uri: imgUrl(p.imageUrl)! }} style={s.img} resizeMode="contain" /> : <Ionicons name="laptop-outline" size={64} color={colors.muted} />}
          <Pressable onPress={onFav} style={s.heart}><Ionicons name={fav ? "heart" : "heart-outline"} size={22} color={fav ? colors.primary : colors.muted} /></Pressable>
        </View>
        <Text style={s.brand}>{p.brand} · {p.category}</Text>
        <Text style={s.name}>{p.name}</Text>
        {p.reviewCount > 0 && <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}><Stars value={p.averageRating} /><Text style={s.muted}>{p.averageRating.toFixed(1)} · {p.reviewCount} avaliações</Text></View>}
        {unavailable ? <Text style={[s.stock, { color: colors.danger }]}>Indisponível</Text>
          : p.lowStock ? <Text style={[s.stock, { color: colors.warning }]}>Últimas unidades</Text>
          : <Text style={[s.stock, { color: colors.teal }]}>Em estoque</Text>}
        <Text style={s.desc}>{p.description}</Text>

        <Text style={s.section}>Avaliações</Text>
        {reviews.length === 0 ? <Text style={s.muted}>Este produto ainda não tem avaliações.</Text> : reviews.slice(0, 8).map((r) => (
          <View key={r.id} style={s.review}>
            <View style={s.avatar}><Text style={s.avatarText}>{initials(r.userFullName)}</Text></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontWeight: "700", color: colors.text }}>{r.userFullName}</Text>
              <Stars value={r.rating} size={12} />
              {r.comment ? <Text style={{ color: colors.textSoft }}>{r.comment}</Text> : null}
              <Text style={s.muted}>{dateBR(r.createdAt)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={s.bar}>
        <View><Text style={s.label}>PREÇO</Text><Text style={s.price}>{money(p.price)}</Text></View>
        <View style={{ flex: 1 }}><Button title={unavailable ? "Indisponível" : busy ? "Adicionando…" : "Adicionar ao carrinho"} onPress={onAdd} disabled={unavailable || busy} /></View>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  imgBox: { height: 280, backgroundColor: colors.imageBg, borderRadius: 24, alignItems: "center", justifyContent: "center", padding: 20, borderWidth: 1, borderColor: colors.border },
  img: { width: "100%", height: "100%" },
  heart: { position: "absolute", top: 12, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  brand: { fontSize: 11, fontWeight: "800", letterSpacing: 1.6, textTransform: "uppercase", color: colors.muted, marginTop: 6 },
  name: { fontSize: 24, fontWeight: "700", color: colors.text },
  muted: { color: colors.muted, fontSize: 12 },
  stock: { fontWeight: "700" },
  desc: { color: colors.textSoft, lineHeight: 22, marginTop: 4 },
  section: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 14 },
  review: { flexDirection: "row", gap: 10, backgroundColor: "#fff", padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.primary, fontWeight: "800" },
  bar: { flexDirection: "row", alignItems: "center", gap: 16, padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: colors.border },
  label: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: colors.muted },
  price: { fontSize: 22, fontWeight: "800", color: colors.text },
});
