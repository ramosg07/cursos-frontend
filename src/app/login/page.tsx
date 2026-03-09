"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Lock } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { print } from "@/lib/print";
import { MessageInterpreter } from "@/lib/messageInterpreter";
import { useAuth } from "@/contexts/AuthProvider";

const formSchema = z.object({
  usuario: z.string().min(3, {
    message: "El nombre de usuario debe tener al menos 3 caracteres",
  }),
  contrasena: z
    .string()
    .min(3, { message: "La contraseña debe tener al menos 3 caracteres" }),
});

export default function Login() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usuario: "",
      contrasena: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoggingIn(true);
    console.warn({ values });
    try {
      await login(values.usuario, values.contrasena);
    } catch (error) {
      print("Login error:", error);
      toast.error("Error de inicio de sesión", {
        description: `${MessageInterpreter(error)}`,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="overflow-hidden relative">
      <div className="w-screen h-screen">
        <Image
          src={theme === "light" ? "/login-light.jpg" : "/login-dark.jpg"}
          alt="Login"
          width={1920}
          height={950}
          className="w-full h-full opacity-50 object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="p-18 rounded-xl shadow-xl bg-indigo-200/40">
          <div className="space-y-2 text-center mb-4">
            <h1 className="text-4xl font-bold text-foreground dark:text-gray-100">
              Inicio de sesión
            </h1>
            <p className="text-balance pt-2 text-muted-foreground dark:text-gray-300">
              Ingresa tus credenciales para iniciar sesión
            </p>
          </div>
          <form
            id="login-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FieldGroup className="gap-4">
              <Controller
                name="usuario"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field className="grid gap-2">
                      <FieldLabel htmlFor="form-usuario">Usuario</FieldLabel>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                          size={18}
                        />
                        <Input
                          {...field}
                          id="usuario"
                          aria-invalid={fieldState.invalid}
                          disabled={isLoggingIn}
                          placeholder="Ingrese su usuario"
                          className="pl-10 dark:bg-gray-900 dark:text-gray-100"
                        />
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />
              <Controller
                name="contrasena"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field className="grid gap-2">
                      <FieldLabel htmlFor="form-contrasena">
                        Contraseña
                      </FieldLabel>
                      <div className="relative">
                        <Lock
                          className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                          size={18}
                        />
                        <Input
                          {...field}
                          id="contrasena"
                          type="password"
                          aria-invalid={fieldState.invalid}
                          disabled={isLoggingIn}
                          placeholder="Ingrese su contraseña"
                          className="pl-10 dark:bg-gray-900 dark:text-gray-100"
                        />
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
            <Link
              href="/recuperacion"
              className={`inline-block text-sm underline hover:text-primary dark:text-gray-300 dark:hover:text-gray-100 ${
                isLoggingIn ? "pointer-events-none opacity-50" : ""
              }`}
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ingresando...
                </span>
              ) : (
                "Ingresar"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm dark:text-gray-300">
            No tienes una cuenta?{" "}
            <Link
              href="/registro"
              className={`underline hover:text-primary dark:hover:text-gray-100 ${
                isLoggingIn ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Regístrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
