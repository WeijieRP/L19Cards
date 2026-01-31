import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, readJsonSafe, setToken, getToken, clearToken } from "../services/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsAuthed(false);
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/api/me");
      const json = await readJsonSafe(res);
      if (!res.ok) throw new Error(json?.error || "Not authed");
      setUser(json);
      setIsAuthed(true);
    } catch {
      clearToken();
      setUser(null);
      setIsAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMe(); }, [loadMe]);

  const login = useCallback(async (username, password) => {
    const res = await apiFetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const json = await readJsonSafe(res);
    if (!res.ok) throw new Error(json?.error || "Login failed");
    setToken(json.token);
    await loadMe();
  }, [loadMe]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setIsAuthed(false);
    setLoading(false);
  }, []);

  const value = useMemo(() => ({ user, isAuthed, loading, login, logout }), [user, isAuthed, loading, login, logout]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
