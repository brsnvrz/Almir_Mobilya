import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const ADMIN_EMAILS = [
  "nevruzbaris@gmail.com",
  "osmanndemir16@gmail.com",
] as const;

export const ADMIN_PASSWORD = "almir2026";

export function isEmailAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((a) => a.toLowerCase().trim() === clean);
}

// Generate valid RFC4122 v4-like UUID deterministically from email without persisting emails in storage
function stringToUUID(str: string): string {
  let h1 = 1779033703 ^ str.length;
  let h2 = 3144134277 ^ str.length;
  let h3 = 1013904242 ^ str.length;
  let h4 = 2773480762 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 597399067);
    h2 = Math.imul(h2 ^ ch, 2869860233);
    h3 = Math.imul(h3 ^ ch, 951274213);
    h4 = Math.imul(h4 ^ ch, 2716044179);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  const p1 = hex(h1);
  const p2 = hex(h2);
  const p3 = hex(h3);
  const p4 = hex(h4);

  // RFC4122 v4-like UUID format (8-4-4-4-12)
  const part1 = p1;
  const part2 = p2.substring(0, 4);
  const part3 = "4" + p2.substring(5, 8);
  const part4 = "a" + p3.substring(1, 4);
  const part5 = p3.substring(4, 8) + p4;

  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

type AuthState = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithEmail: (email: string, password?: string) => Promise<{ user: User; isAdmin: boolean }>;
  signOut: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
  sendOtp?: (email: string) => Promise<void>;
  verifyOtp?: (email: string, token: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = (current: Session | null) => {
    if (!current?.user?.email) {
      setIsAdmin(false);
      return;
    }
    setIsAdmin(isEmailAdmin(current.user.email));
  };

  useEffect(() => {
    let active = true;

    if (typeof window !== "undefined") {
      // Kalıcı localStorage e-posta veya oturum izlerini temizle
      try {
        localStorage.removeItem("almir_session");
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("almir_uid_") || key.startsWith("almir_saved_"))) {
            localStorage.removeItem(key);
          }
        }
      } catch {}

      // Sadece bu sekme oturumunu (sessionStorage) kontrol et
      const saved = sessionStorage.getItem("almir_session");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (active && parsed?.user) {
            setSession(parsed);
            checkAdmin(parsed);
            setLoading(false);
          }
        } catch {}
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      if (nextSession) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("almir_session");
        }
        setSession(nextSession);
        checkAdmin(nextSession);
      }
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        setSession(data.session);
        checkAdmin(data.session);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password?: string) => {
    const clean = email.toLowerCase().trim();
    if (!clean) {
      throw new Error("Lütfen e-posta adresinizi giriniz.");
    }
    if (!clean.includes("@") || !clean.includes(".")) {
      throw new Error("Lütfen geçerli bir e-posta adresi giriniz.");
    }

    const isCurrentAdmin = isEmailAdmin(clean);

    // Yönetici hesapları için şifre zorunludur
    if (isCurrentAdmin) {
      if (!password || !password.trim()) {
        throw new Error("Yönetici girişi için şifre gereklidir.");
      }
      if (password.trim() !== ADMIN_PASSWORD) {
        throw new Error("Yönetici şifresi hatalı!");
      }
    }

    const userId = stringToUUID(clean);

    const fakeUser: User = {
      id: userId,
      app_metadata: { provider: "email" },
      user_metadata: {
        full_name: clean.split("@")[0],
        email: clean,
        role: isCurrentAdmin ? "admin" : "user",
      },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: clean,
      phone: "",
      role: "authenticated",
      updated_at: new Date().toISOString(),
    };

    const fakeSession: Session = {
      access_token: "almir-token-" + Date.now(),
      refresh_token: "almir-refresh-" + Date.now(),
      expires_in: 3600 * 24, // 24 saat
      token_type: "bearer",
      user: fakeUser,
    };

    // Kalıcı localStorage yerine yalnızca bu sekme için sessionStorage kullanılır
    if (typeof window !== "undefined") {
      sessionStorage.setItem("almir_session", JSON.stringify(fakeSession));
    }
    setSession(fakeSession);
    setIsAdmin(isCurrentAdmin);

    return { user: fakeUser, isAdmin: isCurrentAdmin };
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("almir_session");
      localStorage.removeItem("almir_session");
    }
    try {
      await supabase.auth.signOut();
    } catch {}
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAdmin,
        loading,
        signInWithEmail,
        signOut,
        refreshAdmin: async () => {
          checkAdmin(session);
        },
        sendOtp: async (e: string, p?: string) => {
          await signInWithEmail(e, p);
        },
        verifyOtp: async (e: string, p?: string) => {
          await signInWithEmail(e, p);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
