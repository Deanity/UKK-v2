import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginRequest, ApiUser } from "@/services/authService";

// Tipe User disesuaikan dengan response API nyata
export interface User {
  id: number;
  nama: string;
  username: string;
  email: string;
  role: string;
  type: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; role: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // true selama restore token dari localStorage
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: decode JWT payload (tanpa library)
function parseJwt(token: string): { id: number; role: string; type: string } | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // isLoading: true sampai proses restore localStorage selesai
  const [isLoading, setIsLoading] = useState(true);

  // Saat app pertama load: cek token di localStorage agar login tetap persisten
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      try {
        // Validasi token belum expired (opsional: cek exp dari payload)
        const payload = parseJwt(token);
        if (payload) {
          setUser(JSON.parse(savedUser));
        } else {
          // Token rusak, bersihkan
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    // Restore selesai — apapun hasilnya, matikan loading
    setIsLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; message: string; role: string }> => {
    const data = await loginRequest(username, password);

    if (data.status && data.token && data.user) {
      // Simpan token & user ke localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, message: data.message, role: data.user.role };
    }

    return { success: false, message: data.message || "Login gagal", role: "" };
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
