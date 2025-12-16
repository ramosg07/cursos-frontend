"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { siteName } from "@/lib/utilities";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import EmailStep from "./components/EmailStep";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/lib/useApi";
import { toast } from "sonner";
import { MessageInterpreter } from "@/lib/messageInterpreter";
import PasswordStep from "./components/PasswordStep";
import ResponseStep from "./components/ResponseStep";

type Step = "email" | "password" | "response";

export default function DesbloqueoPage() {
  const router = useRouter();
  const { request } = useApi();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("email");
  const [code, setCode] = useState<string | null>(null);

  const codigoDesbloqueo = searchParams.get("q");

  const {
    isLoading: isValidatingCode,
    isError: isValidationError,
    error: validationError,
  } = useQuery({
    queryKey: ["validarCodigo", codigoDesbloqueo],
    queryFn: async () => {
      if (!codigoDesbloqueo)
        throw new Error("No se proporcionó un código de desbloqueo");
      const response = await request<any>({
        url: "/usuarios/validar-recuperar",
        method: "POST",
        data: { codigo: codigoDesbloqueo },
      });
      setCode(response.data.datos.code);
      setStep("password");
      return response.data;
    },
    enabled: !!codigoDesbloqueo,
    retry: false,
  });

  const emailMutation = useMutation({
    mutationFn: async (email: string) => {
      return request({
        url: "/usuarios/recuperar",
        method: "POST",
        data: { correoElectronico: email },
      });
    },
    onSuccess: (data) => {
      setStep("response");
      queryClient.setQueryData(["recoveryResponse"], data);
    },
    onError: (error) => {
      toast.error("Error en validación de correo", {
        description: MessageInterpreter(error),
      });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (password: string) => {
      return request({
        url: "/usuarios/cuenta/nueva-contrasena",
        method: "PATCH",
        data: {
          codigo: code,
          contrasenaNueva: password,
        },
      });
    },
    onSuccess: (data) => {
      setStep("response");
      queryClient.setQueryData(["recoveryResponse"], data);
    },
    onError: (error) => {
      toast.error("Error en validación de contraseña", {
        description: MessageInterpreter(error),
      });
    },
  });

  const responseData: any = queryClient.getQueryData(["recoveryResponse"]);
  const isSuccess = !!responseData;


  const onSubmitEmail = (email: string) => {
    emailMutation.mutate(email);
  };

  const onSubmitPassword = (password: string) => {
    passwordMutation.mutate(password);
  };

  useEffect(() => {
    if (isValidationError) {
      toast.error("Error en validación", {
        description: MessageInterpreter(validationError),
      });
      router.replace("/login");
    }
  }, [isValidationError, validationError, router]);

  useEffect(() => {
    if (codigoDesbloqueo && !isValidatingCode && !isValidationError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep("password");
    }
  }, [codigoDesbloqueo, isValidatingCode, isValidationError]);

  const renderContent = () => {
    if (isValidatingCode) {
      return <div>Validando código...</div>;
    }

    switch (step) {
      case "email":
        return (
          <EmailStep
            onSubmit={onSubmitEmail}
            isLoading={emailMutation.isPending}
          />
        );
      case "password":
        return (
          <PasswordStep
            onSubmit={onSubmitPassword}
            isLoading={passwordMutation.isPending}
          />
        );
      case "response":
        return (
          <ResponseStep
            message={MessageInterpreter(responseData.data)}
            isSuccess={isSuccess}
            onRedirect={() => router.push("/login")}
          />
        );
    }
  };

  return (
    <>
      <title>{`Desbloqueo de cuenta - ${siteName()}`}</title>
      <div className="container flex min-h-screen min-w-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent>{renderContent()}</CardContent>
          <CardFooter className="px-12">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              Volver al inicio de sesión
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
