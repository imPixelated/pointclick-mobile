import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../src/cart";
import { colors } from "../../src/ui";

const icon = (name: keyof typeof Ionicons.glyphMap) => ({ color, size }: { color: string; size: number }) => <Ionicons name={name} size={size} color={color} />;

export default function TabsLayout() {
  const { count } = useCart();
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { backgroundColor: "#fff", borderTopColor: colors.border },
      tabBarLabelStyle: { fontWeight: "600" },
      headerStyle: { backgroundColor: colors.bg }, headerShadowVisible: false,
      headerTitleStyle: { fontWeight: "800", color: colors.text },
      sceneStyle: { backgroundColor: colors.bg },
    }}>
      <Tabs.Screen name="index" options={{ title: "PointClick", tabBarLabel: "Loja", tabBarIcon: icon("storefront-outline"), headerTitleStyle: { fontWeight: "800", fontSize: 22, color: colors.primary } }} />
      <Tabs.Screen name="cart" options={{ title: "Carrinho", tabBarIcon: icon("cart-outline"), tabBarBadge: count > 0 ? count : undefined, tabBarBadgeStyle: { backgroundColor: colors.primary } }} />
      <Tabs.Screen name="orders" options={{ title: "Pedidos", tabBarIcon: icon("receipt-outline") }} />
      <Tabs.Screen name="account" options={{ title: "Conta", tabBarIcon: icon("person-outline") }} />
    </Tabs>
  );
}
