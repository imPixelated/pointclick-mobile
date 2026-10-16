import { Tabs } from "expo-router";
import { useCart } from "../../src/cart";
import { colors } from "../../src/ui";

export default function TabsLayout() {
  const { count } = useCart();
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen name="index" options={{ title: "Loja", tabBarLabel: "Loja" }} />
      <Tabs.Screen name="cart" options={{ title: "Carrinho", tabBarBadge: count > 0 ? count : undefined }} />
      <Tabs.Screen name="orders" options={{ title: "Pedidos" }} />
      <Tabs.Screen name="account" options={{ title: "Conta" }} />
    </Tabs>
  );
}
