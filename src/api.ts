import * as SecureStore from "expo-secure-store";

export const API_URL = "https://pointclick-backend-hrr4.onrender.com";

const K = { token: "pc_token", refresh: "pc_refresh", user: "pc_user" };

export type User = { id: number; fullName: string; email: string; role: string };
export type LoginResponse = { token: string; refreshToken: string; user: User };

export async function saveSession(r: LoginResponse) {
  await SecureStore.setItemAsync(K.token, r.token);
  await SecureStore.setItemAsync(K.refresh, r.refreshToken);
  await SecureStore.setItemAsync(K.user, JSON.stringify(r.user));
}
export async function clearSession() {
  for (const k of Object.values(K)) await SecureStore.deleteItemAsync(k);
}
export async function loadUser(): Promise<User | null> {
  const raw = await SecureStore.getItemAsync(K.user);
  return raw ? (JSON.parse(raw) as User) : null;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

let refreshing: Promise<boolean> | null = null;
async function refresh(): Promise<boolean> {
  const refreshToken = await SecureStore.getItemAsync(K.refresh);
  if (!refreshToken) return false;
  refreshing ??= fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) { await clearSession(); return false; }
      await saveSession((await res.json()) as LoginResponse);
      return true;
    })
    .catch(() => false)
    .finally(() => { refreshing = null; });
  return refreshing;
}

export async function api<T>(path: string, opts: { method?: string; body?: unknown; auth?: boolean; retry?: boolean } = {}): Promise<T> {
  const { method = "GET", body, auth = true, retry = true } = opts;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const t = await SecureStore.getItemAsync(K.token);
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  if (res.status === 401 && auth && retry && (await refresh())) return api<T>(path, { ...opts, retry: false });
  if (!res.ok) {
    let msg = "Erro ao comunicar com a API";
    try { const e = await res.json(); msg = e.detail || e.title || msg; } catch {}
    throw new ApiError(res.status, msg);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const imgUrl = (p?: string | null) => (!p ? null : p.startsWith("http") ? p : `${API_URL}${p.startsWith("/") ? p : "/" + p}`);
