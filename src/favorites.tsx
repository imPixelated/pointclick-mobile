import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./auth";
import { Favorite } from "./types";

type Ctx = { items: Favorite[]; isFav: (id: number) => boolean; toggle: (productId: number) => Promise<void>; reload: () => Promise<void> };
const FavCtx = createContext<Ctx>(null as never);
export const useFavorites = () => useContext(FavCtx);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Favorite[]>([]);
  const reload = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setItems(await api<Favorite[]>("/favorites"));
  }, [user]);
  useEffect(() => { reload().catch(() => setItems([])); }, [reload]);

  const isFav = useCallback((id: number) => items.some((f) => f.product.id === id), [items]);
  const toggle = useCallback(async (productId: number) => {
    const exists = items.some((f) => f.product.id === productId);
    await api(`/favorites/products/${productId}`, { method: exists ? "DELETE" : "POST" });
    await reload();
  }, [items, reload]);

  return <FavCtx.Provider value={{ items, isFav, toggle, reload }}>{children}</FavCtx.Provider>;
}
