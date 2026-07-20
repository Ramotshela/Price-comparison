import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authApi } from "../api/authApi";
import type { User, AuthContextValue } from "../types/models";
import { useIdleTimer } from "../hooks/useIdleTimer";
import IdleWarning from "../components/IdleWarning";

const AuthContext = createContext<AuthContextValue | null>(null);

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem(ACCESS_KEY));
  const [loading, setLoading] = useState(!!localStorage.getItem(ACCESS_KEY));

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    authApi
      .getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        setAccessToken(null);
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  const storeTokens = (at: string, rt: string) => {
    localStorage.setItem(ACCESS_KEY, at);
    localStorage.setItem(REFRESH_KEY, rt);
    setAccessToken(at);
  };

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    storeTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await authApi.register(name, email, password);
    storeTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    const rt = localStorage.getItem(REFRESH_KEY);
    if (rt) await authApi.logout(rt).catch(() => {});
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setAccessToken(null);
    setUser(null);
  }, []);

  const secondsLeft = useIdleTimer(logout, IDLE_TIMEOUT, !!user);

  const updateProfile = useCallback(async (fields: { name?: string; email?: string }) => {
    const updated = await authApi.updateProfile(fields);
    setUser(updated);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await authApi.changePassword(currentPassword, newPassword);
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, updateProfile, changePassword }}>
      {children}
      {user && <IdleWarning secondsLeft={secondsLeft} onStayLoggedIn={() => window.dispatchEvent(new MouseEvent("mousemove"))} />}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
