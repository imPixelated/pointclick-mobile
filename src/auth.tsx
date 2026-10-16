import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, clearSession, loadUser, saveSession, LoginResponse, User } from "./api";

type Ctx = {
  user: User | null; loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
const AuthCtx = createContext<Ctx>(null as never);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadUser().then(setUser).finally(() => setLoading(false)); }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<LoginResponse>("/auth/login", { method: "POST", body: { email, password }, auth: false });
    await saveSession(r); setUser(r.user);
  }, []);
  const register = useCallback(async (fullName: string, email: string, password: string) => {
    await api("/users", { method: "POST", body: { fullName, email, password }, auth: false });
    await login(email, password);
  }, [login]);
  const logout = useCallback(async () => {
    try { await api("/auth/logout", { method: "POST" }); } catch {}
    await clearSession(); setUser(null);
  }, []);

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}
