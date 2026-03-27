"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { validateDateFormat } from "@/lib/dates";
import { MessageInterpreter } from "@/lib/messageInterpreter";
import { useApi } from "@/lib/useApi";
import { encodeBase64, securityPassword, siteName } from "@/lib/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IdCard,
  Loader2,
  Mail,
  Phone,
  User,
  UserPlus,
  Lock,
  EyeOff,
  Eye,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const registroSchema = z
  .object({
    nroDocumento: z.string().min(5, {
      message: "El número de documento debe tener al menos 5 caracteres.",
    }),
    nombres: z
      .string()
      .min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    primerApellido: z.string().min(2, {
      message: "El primer apellido debe tener al menos 2 caracteres.",
    }),
    segundoApellido: z.string().optional(),
    fechaNacimiento: z.string().refine(
      (date) => {
        return validateDateFormat(date, "YYYY-MM-DD");
      },
      {
        message: "Fecha de nacimiento inválida",
      }
    ),
    correoElectronico: z.string().email("Ingrese un correo electrónico válido"),
    telefono: z
      .string()
      .nullable()
      .refine(
        (value) => value === null || value === "" || /^[6-7]\d{7}$/.test(value),
        {
          message: "Debe ser un teléfono válido",
        }
      )
      .optional(),
    contrasenaNueva: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmacionContrasena: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
  })
  .refine((data) => data.contrasenaNueva === data.confirmacionContrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmacionContrasena"],
  });

export default function RegistroPage() {
  const form = useForm<z.infer<typeof registroSchema>>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      nroDocumento: "",
      nombres: "",
      primerApellido: "",
      segundoApellido: "",
      fechaNacimiento: "",
      correoElectronico: "",
      contrasenaNueva: "",
      confirmacionContrasena: "",
      telefono: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const { request } = useApi();

  const onSubmit = async (data: z.infer<typeof registroSchema>) => {
    if (passwordStrength < 3) {
      form.setError("contrasenaNueva", {
        message: "La contraseña no es lo suficientemente segura.",
      });
      return;
    }
    setIsLoading(true);
    try {
      await request({
        url: "/usuarios/crear-cuenta",
        method: "POST",
        data: {
          correoElectronico: data.correoElectronico,
          contrasenaNueva: encodeBase64(encodeURI(data.contrasenaNueva)),
          persona: {
            nombres: data.nombres,
            primerApellido: data.primerApellido,
            segundoApellido: data.segundoApellido,
            nroDocumento: data.nroDocumento,
            fechaNacimiento: data.fechaNacimiento,
            telefono: data.telefono === "" ? null : data.telefono,
          },
        },
      });
      setIsSuccess(true);
    } catch (error) {
      toast.error("Error en creación de cuenta", {
        description: MessageInterpreter(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl font-bold">
              Registro Exitoso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              Tu cuenta ha sido creada con éxito. Por favor, revisa tu correo
              electrónico para encontrar el enlace de activación.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/login")}>
              Ir al inicio de sesión
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <title>{`Registro - ${siteName()}`}</title>
      <div className="container flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <UserPlus className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-center text-2xl font-bold">
              Crea tu cuenta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FieldGroup className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <FieldLabel className="font-semibold">
                    Datos personales
                  </FieldLabel>
                </div>
                <Controller
                  name="nroDocumento"
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field className="col-span-2 md:col-span-1 gap-1">
                        <FieldLabel>Nro. Documento</FieldLabel>
                        <div className="relative">
                          <IdCard
                            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                            size={18}
                          />
                          <Input
                            id="nroDocumento"
                            className="pl-10"
                            placeholder="Ingrese Cedula de Identidad"
                            {...field}
                            aria-invalid={fieldState.invalid}
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
                  name="nombres"
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field className="col-span-2 md:col-span-1 gap-1">
                        <FieldLabel>Nombres</FieldLabel>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                            size={18}
                          />
                          <Input
                            id="nombres"
                            className="pl-10 uppercase"
                            placeholder="Ingrese sus nombres"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value.toUpperCase())
                            }
                            aria-invalid={fieldState.invalid}
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
                  name="primerApellido"
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field className="col-span-2 md:col-span-1 gap-1">
                        <FieldLabel>Primer Apellido</FieldLabel>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                            size={18}
                          />
                          <Input
                            id="primerApellido"
                            className="pl-10"
                            placeholder="Ingrese su primer apellido"
                            {...field}
                            aria-invalid={fieldState.invalid}
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
                  name="segundoApellido"
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field className="col-span-2 md:col-span-1 gap-1">
                        <FieldLabel>Segundo Apellido</FieldLabel>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                            size={18}
                          />
                          <Input
                            id="segundoApellido"
                            className="pl-10"
                            placeholder="Ingrese su segundo apellido"
                            {...field}
                            aria-invalid={fieldState.invalid}
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
                  name="fechaNacimiento"
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field className="col-span-2 md:col-span-1 gap-1">
                        <FieldLabel>Fecha Nacimiento</FieldLabel>
                        <Input
                          id="fechaNacimiento"
                          placeholder="Ingrese su fecha de nacimiento"
                          type="date"
                          {...field}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    );
                  }}
                />
                <div className="col-span-2 pt-3">
                  <FieldLabel className="font-semibold">
                    Datos de contacto
                  </FieldLabel>
                </div>
                <Controller
                  name="correoElectronico"
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field className="col-span-2 gap-1">
                        <FieldLabel>Correo electrónico</FieldLabel>
                        <div className="relative">
                          <Mail
                            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                            size={18}
                          />
                          <Input
                            id="correoElectronico"
                            className="pl-10"
                            placeholder="tu@email.com"
                            {...field}
                            aria-invalid={fieldState.invalid}
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
                  name="telefono"
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field className="col-span-2 md:col-span-1 gap-1">
                        <FieldLabel>Teléfono</FieldLabel>
                        <div className="relative">
                          <Phone
                            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                            size={18}
                          />
                          <Input
                            id="telefono"
                            className="pl-10"
                            placeholder="Ingrese su teléfono"
                            type="tel"
                            value={field.value ?? undefined}
                            ref={field.ref}
                            name={field.name}
                            onBlur={field.onBlur}
                            onChange={field.onChange}
                            disabled={field.disabled}
                            aria-invalid={fieldState.invalid}
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
                  name="contrasenaNueva"
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field className="col-span-2 gap-1">
                        <FieldLabel>Contraseña</FieldLabel>
                        <div className="relative">
                          <Lock
                            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                            size={18}
                          />
                          <Input
                            id="password"
                            className="pl-10 pr-10"
                            type={showPassword ? "text" : "password"}
                            placeholder="Ingrese su contraseña"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              securityPassword(e.target.value).then(
                                (result) => {
                                  setPasswordStrength(result.score);
                                }
                              );
                            }}
                            aria-invalid={fieldState.invalid}
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
                    );
                  }}
                />
                <Controller
                  name="confirmacionContrasena"
                  control={form.control}
                  render={({ field, fieldState }) => {
                    return (
                      <Field className="col-span-2 gap-1">
                        <FieldLabel>Confirmar Contraseña</FieldLabel>
                        <div className="relative">
                          <Lock
                            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                            size={18}
                          />
                          <Input
                            id="confirmarPassword"
                            className="pl-10 pr-10"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirme su contraseña"
                            {...field}
                            aria-invalid={fieldState.invalid}
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
                    );
                  }}
                />
              </FieldGroup>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Registrarse
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="w-full text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <a href="/login" className="text-primary hover:underline">
                Inicia sesión
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
