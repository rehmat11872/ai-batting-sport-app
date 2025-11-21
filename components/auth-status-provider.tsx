"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface UserSession {
  userId: string;
  isSubscribed: boolean;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  session: UserSession | null;
  loading: boolean;
  error: string | null;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthStatusProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to check authentication");
      }

      const data = await response.json();
      
      if (!data.session) {
        setSession(null);
        setLoading(false);
        return;
      }

      if (data.session && typeof data.session === "object") {
        setSession(data.session);
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setError("Network error");
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for custom auth events
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    window.addEventListener("auth-changed", handleAuthChange);
    
    // Listen for storage events (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "session_updated" || e.key === null) {
        checkAuthStatus();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    
    // Listen for focus (user returns to tab)
    const handleFocus = () => {
      checkAuthStatus();
    };
    window.addEventListener("focus", handleFocus);

    // Periodic check for expired tokens (if logged in)
    const interval = setInterval(() => {
      if (session) {
        checkAuthStatus();
      }
    }, 30000);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, [session]);

  return (
    <AuthContext.Provider value={{ session, loading, error, refreshAuth: checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthStatusProvider");
  }
  return context;
}

