import { Stack } from "expo-router";
import { AuthProvider } from "../src/auth";
import { CartProvider } from "../src/cart";
import { FavoritesProvider } from "../src/favorites";

export default function Root() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <Stack screenOptions={{ headerStyle: { backgroundColor: "#f8f7f3" }, headerTintColor: "#1f1b16", headerTitleStyle: { fontWeight: "700" }, headerShadowVisible: false, contentStyle: { backgroundColor: "#f8f7f3" } }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="product/[id]" options={{ title: "Produto" }} />
            <Stack.Screen name="checkout" options={{ title: "Finalizar compra" }} />
            <Stack.Screen name="payment/[orderId]" options={{ title: "Pagamento" }} />
            <Stack.Screen name="order/[id]" options={{ title: "Pedido" }} />
            <Stack.Screen name="favorites" options={{ title: "Favoritos" }} />
            <Stack.Screen name="notifications" options={{ title: "Notificações" }} />
            <Stack.Screen name="profile" options={{ title: "Meus dados" }} />
            <Stack.Screen name="review/index" options={{ title: "Avaliar produto", presentation: "modal" }} />
            <Stack.Screen name="login" options={{ title: "Entrar", presentation: "modal" }} />
            <Stack.Screen name="register" options={{ title: "Criar conta", presentation: "modal" }} />
          </Stack>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}
