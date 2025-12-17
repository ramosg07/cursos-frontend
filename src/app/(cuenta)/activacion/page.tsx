"use client";

import { CustomProgressBar } from "@/components/CustomProgressBar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Constants } from "@/config/Constants";
import { useLoading } from "@/contexts/LoadingProvider";
import { useApi } from "@/lib/useApi";
import { delay, siteName } from "@/lib/utilities";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { print } from "@/lib/print";
import { useEffect } from "react";
import { MessageInterpreter } from "@/lib/messageInterpreter";
import { AxiosError } from "axios";

export default function ActivacionPage() {
  const { showLoading, hideLoading } = useLoading();
  const searchParams = useSearchParams();
  const { request } = useApi();
  const router = useRouter();

  const codigoActivar = searchParams.get("q");

  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["activacion", codigoActivar],
    queryFn: async () => {
      if (!codigoActivar)
        throw new Error("Código de activación no proporcionado");
      await delay(1000); // Mantenemos el delay para simular carga
      const respuesta = await request({
        url: `${Constants.baseUrl}/usuarios/cuenta/activacion`,
        method: "patch",
        data: { codigo: codigoActivar },
      });
      return respuesta.data;
    },
    enabled: !!codigoActivar,
    retry: false,
  });

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  const redireccionarInicio = async () => {
    showLoading();
    await delay(1000);
    router.replace("/login");
    hideLoading();
  };

  const mensaje = isError
    ? MessageInterpreter(
        error instanceof AxiosError ? error.response?.data : String(error)
      )
    : data
    ? MessageInterpreter(data)
    : "";

  print("Estado de activación:", {
    isLoading,
    isError,
    data,
    error,
    mensaje,
  });

  return (
    <>
      <title>{`Activación de cuenta - ${siteName()}`}</title>
      <div className="container flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              {isLoading ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              ) : isError ? (
                <XCircle className="h-12 w-12 text-red-500" />
              ) : (
                <CheckCircle className="h-12 w-12 text-green-500" />
              )}
            </div>
            <CardTitle className="text-center text-2xl font-bold">
              {isLoading
                ? "Activando cuenta"
                : isError
                ? "Error de activación"
                : "Cuenta Activa"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <p className="text-center text-gray-600">
                  Procesando su solicitud...
                </p>
                <CustomProgressBar
                  value={33}
                  className="w-full"
                  indicatorColor={"bg-background"}
                />
              </div>
            ) : (
              <p className="text-center text-gray-600">{mensaje}</p>
            )}
          </CardContent>
          <CardFooter>
            {!isLoading && (
              <Button className="w-full" onClick={redireccionarInicio}>
                Ir al inicio de sesión
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
