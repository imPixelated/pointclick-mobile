import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { ProductCard } from "../src/ProductCard";
import { useAuth } from "../src/auth";
import { useFavorites } from "../src/favorites";
import { Button, colors, Empty } from "../src/ui";

export default function Favorites() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, reload } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);
  useFocusEffect(useCallback(() => { reload().catch(() => {}); }, [reload]));

  if (!user) return <Empty icon="heart-outline" text="Entre para ver seus favoritos." action={<Button title="Entrar" onPress={() => router.push("/login")} />} />;
  return (
    <FlatList
      style={{ backgroundColor: colors.bg }} data={items} keyExtractor={(f) => String(f.id)} numColumns={2}
      contentContainerStyle={{ padding: 12 }} columnWrapperStyle={{ gap: 12 }}
      refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await reload().catch(() => {}); setRefreshing(false); }}
      ListEmptyComponent={<Empty icon="heart-outline" text="Você ainda não favoritou nenhum produto. Toque no coração de um produto para salvar aqui." />}
      renderItem={({ item }) => <ProductCard p={item.product} />}
    />
  );
}
