"use client";

import { createContext, ReactNode, useContext, FC, useState } from "react";
import { User } from "./types/AuthTypes";
import { print } from "@/lib/print";
import { useApi } from "@/lib/useApi";
import { encodeBase64 } from "@/lib/utilities";
import { guardarCookie } from "@/lib/cookies";
import { useRouter } from "next/navigation";

interface AuthContextType {
  // user: User | null;
  login: (user: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  // const { showLoading, hideLoading } = useLoading()

  const router = useRouter()
  const { request } = useApi();


  const login = async (user: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const data = await request<any>({
        url: "/auth",
        method: "POST",
        data: {
          usuario: user,
          contrasena: encodeBase64(encodeURI(password)),
        },
      });
      console.log({ data });

      // showLoading("Iniciando sesión");

      const { access_token, roles, ...rest } = data.data.datos;
      const userData: User = { token: access_token, roles, ...rest };

      setUser(userData);
      guardarCookie("auth", access_token, { path: "/" });

      router.replace("/admin/home");
    } catch (error) {
      print("Login error", error);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        // user,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
