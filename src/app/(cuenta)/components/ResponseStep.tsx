import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResponseStepProps {
  message: string;
  isSuccess: boolean;
  onRedirect: () => void;
}

export default function ResponseStep({
  message,
  isSuccess,
  onRedirect,
}: ResponseStepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Resultado
        </CardTitle>
        <CardDescription className="text-center">
          Información sobre tu solicitud.
        </CardDescription>
      </CardHeader>
      <div className="text-center mt-4">
        {isSuccess ? (
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        ) : (
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
        )}
        <p className="mt-4 text-xl font-semibold">{message}</p>
        <Button onClick={onRedirect} className="mt-4 w-full">
          Ir al inicio de sesión
        </Button>
      </div>
    </>
  );
}
