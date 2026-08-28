"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, DEMO_MODE, getToken, setToken } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthValue = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    // في وضع العرض لا يوجد خادم مصادقة، وبلا توكن محفوظ لا داعي لسؤاله
    if (DEMO_MODE || !getToken()) {
      setUser(null);
      return;
    }
    try {
      const { user } = await api<{ user: User }>("/api/auth/me");
      setUser(user);
    } catch {
      setToken(null); // توكن منتهٍ أو تالف — ننظّفه ونتابع كزائر
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // نُشغّل الجلب داخل دالة حتى لا نُحدّث الحالة مباشرة في جسم الـ effect
    let cancelled = false;
    const load = async () => {
      await refresh();
      if (!cancelled) setReady(true);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await api<{ user: User; token: string }>(
      "/api/auth/login",
      { method: "POST", json: { email, password }, auth: false },
    );
    setToken(token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; phone?: string; password: string }) => {
      const { user, token } = await api<{ user: User; token: string }>(
        "/api/auth/register",
        { method: "POST", json: input, auth: false },
      );
      setToken(token);
      setUser(user);
      return user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      /* حتى لو فشل النداء نُنظّف الجلسة محليًا */
    }
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, ready, login, register, logout, refresh }),
    [user, ready, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
