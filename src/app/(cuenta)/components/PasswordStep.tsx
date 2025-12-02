import React, { useState } from "react";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Eye, EyeOff, LockKeyhole, Lock, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { encodeBase64, securityPassword } from "@/lib/utilities";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";

interface PasswordStepProps {
  onSubmit: (password: string) => void;
  isLoading: boolean;
}

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function PasswordStep({
  onSubmit,
  isLoading,
}: PasswordStepProps) {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleSubmit = (data: z.infer<typeof passwordSchema>) => {
    if (passwordStrength < 3) {
      form.setError("password", {
        message: "La contraseña no es lo suficientemente segura.",
      });
      return;
    }
    onSubmit(encodeBase64(encodeURI(data.password)));
  };

  return (
    <>
      <CardHeader>
        <div className="mb-6 flex justify-center">
          <LockKeyhole className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-center text-2xl font-bold">
          Cambia tu contraseña
        </CardTitle>
        <CardDescription className="mt-2 text-center">
          Ingresa tu nueva contraseña para recuperar tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-4">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup className="gap-5">
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Nueva Contraseña</FieldLabel>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                      size={18}
                    />
                    <Input
                      {...field}
                      id="nueva-contrasena"
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => {
                        field.onChange(e);
                        securityPassword(e.target.value).then((result) => {
                          setPasswordStrength(result.score);
                        });
                      }}
                      className="pl-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Confirmar Contraseña</FieldLabel>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                      size={18}
                    />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                      className="pl-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <PasswordStrengthIndicator strength={passwordStrength} />
            <Button type="submit" className="w-full " disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Cambiar Contraseña
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </>
  );
}
