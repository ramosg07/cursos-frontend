import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Send } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

interface EmailStepProps {
  onSubmit: (email: string) => void;
  isLoading: boolean;
}

const emailSchema = z.object({
  email: z.string().email("Ingrese un correo electrónico válido"),
});

export default function EmailStep({ onSubmit, isLoading }: EmailStepProps) {
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = (data: z.infer<typeof emailSchema>) => {
    onSubmit(data.email);
  };

  return (
    <>
      <CardHeader>
        <div className="mb-4 flex items-center justify-center">
          <Mail className="h-12 w-12 text-indigo-400" />
        </div>
        <CardTitle className="text-center text-2xl font-bold">
          Recupera tu cuenta
        </CardTitle>
        <CardDescription className="mt-2 text-center">
          Ingresa tu correo electrónico para recibir un enlace de recuperación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="email-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Field className="grid gap-2">
                  <FieldLabel htmlFor="form-email">
                    Correo electrónico
                  </FieldLabel>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                      size={18}
                    />
                    <Input
                      {...field}
                      id="usuario"
                      placeholder="tu@email.com"
                      aria-invalid={fieldState.invalid}
                      className="pl-10 dark:bg-gray-900 dark:text-gray-100"
                      style={{}}
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Enviar enlace de recuperación
          </Button>
        </form>
      </CardContent>
    </>
  );
}
