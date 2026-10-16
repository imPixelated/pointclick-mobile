import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";
import { useAuth } from "./auth";
import { Order } from "./types";

type Ctx = {
  cart: Order | null; count: number;
  reload: () => Promise<void>;
  add: (productId: number, quantity?: number) => Promise<void>;
  setQty: (itemId: number, quantity: number) => Promise<void>;
  remove: (itemId: number) => Promise<void>;
};
const CartCtx = createContext<Ctx>(null as never);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Order | null>(null);

  const reload = useCallback(async () => {
    if (!user) { setCart(null); return; }
    const c = await api<Order | undefined>("/orders/current");
    setCart(c ?? null);
  }, [user]);
  useEffect(() => { reload().catch(() => setCart(null)); }, [reload]);

  const add = useCallback(async (productId: number, quantity = 1) => {
    if (!user) throw new Error("Faça login para adicionar ao carrinho.");
    let c = cart ?? (await api<Order | undefined>("/orders/current")) ?? null;
    if (!c) c = await api<Order>("/orders", { method: "POST", body: { userId: user.id } });
    setCart(await api<Order>(`/orders/${c.id}/items`, { method: "POST", body: { productId, quantity } }));
  }, [cart, user]);
  const setQty = useCallback(async (itemId: number, quantity: number) => {
    if (!cart) return;
    setCart(await api<Order>(`/orders/${cart.id}/items/${itemId}`, { method: "PUT", body: { quantity } }));
  }, [cart]);
  const remove = useCallback(async (itemId: number) => {
    if (!cart) return;
    await api(`/orders/${cart.id}/items/${itemId}`, { method: "DELETE" });
    await reload();
  }, [cart, reload]);

  const count = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  return <CartCtx.Provider value={{ cart, count, reload, add, setQty, remove }}>{children}</CartCtx.Provider>;
}
