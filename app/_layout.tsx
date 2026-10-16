import { Stack } from "expo-router";
import { AuthProvider } from "../src/auth";
import { CartProvider } from "../src/cart";

export default function Root() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ title: "Produto" }} />
          <Stack.Screen name="checkout" options={{ title: "Finalizar compra" }} />
          <Stack.Screen name="payment/[orderId]" options={{ title: "Pagamento" }} />
          <Stack.Screen name="order/[id]" options={{ title: "Pedido" }} />
          <Stack.Screen name="login" options={{ title: "Entrar", presentation: "modal" }} />
          <Stack.Screen name="register" options={{ title: "Criar conta", presentation: "modal" }} />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
