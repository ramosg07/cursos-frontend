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
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <Image
          src={theme === "light" ? "/login-light.jpg" : "/login-dark.jpg"}
          alt="Login Background"
          fill
          className="object-cover opacity-40 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/80 to-primary/10" />
      </div>

      {/* Decorative Blobs */}
      <div className="absolute top-1/4 -left-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 -right-12 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "-3s" }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className=" glass-card p-8 md:p-12 rounded-3xl border border-white/20 shadow-2xl overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="space-y-3 text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-gradient">
              Bienvenido
            </h1>
            <p className="text-balance text-muted-foreground/80 font-medium">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form
            id="login-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FieldGroup className="gap-5">
              <Controller
                name="usuario"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2">
                    <FieldLabel
                      htmlFor="usuario"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Usuario
                    </FieldLabel>
                    <div className="relative group/field">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 transform text-muted-foreground/60 transition-colors group-focus-within/field:text-primary">
                        <User size={18} />
                      </div>
                      <Input
                        {...field}
                        id="usuario"
                        aria-invalid={fieldState.invalid}
                        disabled={isLoggingIn}
                        placeholder="Tu nombre de usuario"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        className="pl-12 h-12 bg-background/40 border-white/20 rounded-xl focus:ring-primary/20 focus:border-primary transition-all duration-300"
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="contrasena"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="grid gap-2">
                    <FieldLabel
                      htmlFor="contrasena"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1"
                    >
                      Contraseña
                    </FieldLabel>
                    <div className="relative group/field">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 transform text-muted-foreground/60 transition-colors group-focus-within/field:text-primary">
                        <Lock size={18} />
                      </div>
                      <Input
                        {...field}
                        id="contrasena"
                        type="password"
                        aria-invalid={fieldState.invalid}
                        disabled={isLoggingIn}
                        placeholder="••••••••"
                        className="pl-12 h-12 bg-background/40 border-white/20 rounded-xl focus:ring-primary/20 focus:border-primary transition-all duration-300"
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="flex items-center justify-between px-1">
              <Link
                href="/recuperacion"
                className={`text-sm font-semibold text-muted-foreground hover:text-primary transition-colors ${
                  isLoggingIn ? "pointer-events-none opacity-50" : ""
                }`}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* <Link
              href="/recuperacion"
              className={`inline-block text-sm underline hover:text-primary dark:text-gray-300 dark:hover:text-gray-100 ${
                isLoggingIn ? "pointer-events-none opacity-50" : ""
              }`}
            >
              ¿Olvidaste tu contraseña?
            </Link> */}

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 group/btn"
              disabled={isLoggingIn}
            >
              {/* <Button type="submit" className="w-full" disabled={isLoggingIn}> */}
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Cargando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Ingresar
                  <div className="group-hover/btn:translate-x-1 transition-transform">
                    →
                  </div>
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/registro"
                className={`font-bold text-primary hover:text-primary/80 transition-colors underline decoration-2 underline-offset-4 ${
                  isLoggingIn ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Regístrate ahora
              </Link>
            </p>
          </div>
          {/* <div className="mt-4 text-center text-sm dark:text-gray-300">
            No tienes una cuenta?{" "}
            <Link
              href="/registro"
              className={`underline hover:text-primary dark:hover:text-gray-100 ${
                isLoggingIn ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Regístrate
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
