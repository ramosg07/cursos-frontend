"use client";

import {
  createContext,
  ReactNode,
  useContext,
  FC,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { PoliticasResponse, User } from "./types/AuthTypes";
import { print } from "@/lib/print";
import { useApi } from "@/lib/useApi";
import { delay, encodeBase64 } from "@/lib/utilities";
import { eliminarCookie, guardarCookie, leerCookie } from "@/lib/cookies";
import { useRouter } from "next/navigation";
import { useLoading } from "./LoadingProvider";
import { type Enforcer } from "casbin";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { basicModel, basicPolicy } from "./types/CasbinTypes";
import { verificarToken } from "@/lib/token";
import { httpClient } from "@/lib/HttpClient";

interface AuthContextType {
  user: User | null;
  login: (user: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  enforcer: Enforcer | null;
  fetchUserProfile: () => Promise<void>;
  updateProfile: () => Promise<void>;
  checkPermission: (obj: string, act: string) => Promise<boolean>;
  isAuthLoading: boolean;
  sessionRequest: <T>(config: AxiosRequestConfig) => Promise<AxiosResponse<T> | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let requestCounter = 0;

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [enforcer, setEnforcer] = useState<Enforcer | null>(null);

  const sessionRequestRef = useRef<<T>(config: AxiosRequestConfig) => Promise<AxiosResponse<T> | undefined>
  >(() => Promise.resolve(undefined));
  const logoutRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const router = useRouter();
  const { request, isNetworkError } = useApi();
  const { showLoading, hideLoading } = useLoading();

  const initializeCasbin = useCallback(async (permissions: string[][]) => {
    const casbinLib = await import("casbin");
    print(`casbinLib`, casbinLib);
    const model = casbinLib.newModelFromString(basicModel);
    const policy = new casbinLib.StringAdapter(basicPolicy);
    const enforcerTemp = await casbinLib.newEnforcer(model, policy);
    for await (const p of permissions) {
      await enforcerTemp.addPolicy(p[0], p[1], p[2], p[3], p[4], p[5]);
    }
    setEnforcer(enforcerTemp);
  }, []);

  const verifyToken = useCallback(async () => {
    const currentToken = leerCookie("auth");
    if (!currentToken) return null;

    try {
      const decodedToken = verificarToken(currentToken);

      if (decodedToken) {
        print("El token aún es válido");
        return currentToken;
      }

      print(
        "El token ha expirado o está a punto de expirar, intentamos renovarlo"
      );
      const response = await request<any>({
        url: "/token",
        method: "post",
        data: { token: currentToken },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
      });

      print(response);

      const newToken = response.data.datos.access_token;
      guardarCookie("auth", newToken, { path: "/" });
      return newToken;
    } catch (error) {
      print("Error verifying/refreshing token:", error);
      await logoutRef.current();
      return null;
    }
  }, [request]);

  const sessionRequest = useCallback(
    async <T,>(
      config: AxiosRequestConfig
    ): Promise<AxiosResponse<T> | undefined> => {
      const requestId = `REQ_${++requestCounter}`;
      print(
        `🔐 [${requestId}] Iniciando petición autenticada ${config.method?.toUpperCase()} a ${
          config.url
        }`
      );
      print(`📊 [${requestId}] Parámetros:`, config.params || "Ninguno");
      print(
        `📦 [${requestId}] Cuerpo de la petición:`,
        config.data || "Ninguno"
      );

      try {
        const token = await verifyToken();
        print(
          `🎟️ [${requestId}] Token verificado:`,
          token ? "Válido" : "Inválido o expirado"
        );

        if (!token) {
          print(`🚫 [${requestId}] No hay token válido, redirigiendo a login`);
          await logoutRef.current();
          return;
        }

        const response = await httpClient.request<T>({
          ...config,
          headers: {
            ...config.headers,
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        print(
          `✅ [${requestId}] Petición exitosa: ${response.status} ${response.statusText}`
        );
        print(`📩 [${requestId}] Respuesta:`, response.data);

        return response;
      } catch (e: any) {
        print(`🔥 [${requestId}] Error en la petición autenticada:`, e);

        if (e.code === "ECONNABORTED") {
          throw new Error("La petición está tardando demasiado");
        }

        if (isNetworkError(e)) {
          throw new Error("Error en la conexión 🌎");
        }

        if ([401].includes(e.response?.status)) {
          await logoutRef.current();
          return;
        }

        throw e.response?.data;
      }
    },
    [verifyToken, isNetworkError]
  );

  sessionRequestRef.current = sessionRequest;

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
      await delay(500);
      showLoading("Iniciando sesión");

      const { access_token, roles, ...rest } = data.data.datos;
      const userData: User = { token: access_token, roles, ...rest };

      setUser(userData);
      guardarCookie("auth", access_token, { path: "/" });

      const permissions = await fetchPermissions();
      print("permisos login: ", permissions, typeof permissions);
      await initializeCasbin(permissions ?? []);

      await delay(500);
      router.replace("/admin/home");
    } catch (error) {
      print("Login error", error);
      throw error;
    } finally {
      setIsAuthLoading(false);
      await delay(100);
      hideLoading();
    }
  };

  const logout = useCallback(async () => {
    try {
      showLoading("Cerrando sesión");
      await delay(1000);
      const token = leerCookie("auth");
      if (token) {
        const response = await request<any>({
          url: "/logout",
          method: "get",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.finalizado) {
          router.replace("/login");
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      print("Error during logout:", error);
      window.location.reload();
    } finally {
      setUser(null);
      eliminarCookie("auth");
      setEnforcer(null);
      hideLoading();
    }
  }, [showLoading, request, router, hideLoading]);

  logoutRef.current = logout;

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await sessionRequestRef.current<PoliticasResponse>({
        url: "/autorizacion/permisos",
        method: "get",
      });
      return response?.data.datos;
    } catch (error) {
      print("Error fetching permissions:", error);
      throw error;
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const data = await sessionRequestRef.current<any>({
        url: "/usuarios/cuenta/perfil",
        method: "get",
      });

      const { access_token, roles, ...rest } = data?.data.datos;
      const userData: User = { token: access_token, roles, ...rest };

      setUser(userData);

      const permissions = await fetchPermissions();
      print("permisos fetchUserProfile: ", permissions, typeof permissions);
      await initializeCasbin(permissions ?? []);
    } catch (error) {
      print("Error fetching user profile:", error);
      await logoutRef.current();
    } finally {
      setIsAuthLoading(false);
    }
  }, [initializeCasbin, fetchPermissions]);

  const updateProfile = async () => {
    try {
      const data = await sessionRequestRef.current<any>({
        url: "/usuarios/cuenta/perfil",
        method: "get",
      });

      const { access_token, roles, ...rest } = data?.data.datos;
      const userData: User = { token: access_token, roles, ...rest };

      setUser(userData);
    } catch (error) {
      print("Error updating profile:", error);
      throw error;
    }
  };

  const selectedRole = user?.roles.find((role) => role.idRol === user.idRol);

  const checkPermission = async (
    obj: string,
    act: string
  ): Promise<boolean> => {
    if (!enforcer || !user) return false;
    print("validando: ", selectedRole?.rol, obj, act);
    return await enforcer.enforce(selectedRole?.rol, obj, act);
  };

  useEffect(() => {
    const token = leerCookie("auth");
    if (token && !isAuthLoading && !user) {
      fetchUserProfile().catch(print);
    }
  }, [isAuthLoading, user, fetchUserProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        enforcer,
        isAuthLoading,
        checkPermission,
        fetchUserProfile,
        updateProfile,
        sessionRequest,
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
