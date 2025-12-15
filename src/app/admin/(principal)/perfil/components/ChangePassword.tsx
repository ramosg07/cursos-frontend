import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthProvider";
import { MessageInterpreter } from "@/lib/messageInterpreter";
import { encodeBase64, securityPassword } from "@/lib/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

interface ChangePasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ isOpen, onClose }) => {
  const { sessionRequest } = useAuth();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Seguridad del password
  const newPassword = useWatch({
    control: form.control,
    name: "newPassword",
    defaultValue: "",
  });

  useEffect(() => {
    if (newPassword) {
      securityPassword(newPassword).then((result) => {
        setPasswordStrength(result.score);
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPasswordStrength(0);
    }
  }, [newPassword]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError("");
    if (passwordStrength < 3) {
      setError("La contraseña no es lo suficientemente segura.");
      return;
    }
    try {
      const result = await sessionRequest({
        url: "/usuarios/cuenta/contrasena",
        method: "PATCH",
        data: {
          contrasenaActual: encodeBase64(values.currentPassword),
          contrasenaNueva: encodeBase64(values.newPassword),
        },
      });
      onClose();
      toast.success("Contraseña actualizada", {
        description: MessageInterpreter(result?.data),
      });
      form.reset();
    } catch (error) {
      setError(MessageInterpreter(error));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-y-auto">
        <DialogHeader className="relative">
          <DialogTitle>Cambiar Contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu contraseña actual y la nueva contraseña para realizar el
            cambio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup className="gap-4">
            <Controller
              name="currentPassword"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field className="grid gap-2">
                    <FieldLabel>Contraseña Actual</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="password"
                        type={showCurrentPassword ? "text" : "password"}
                        aria-invalid={fieldState.invalid}
                        placeholder="Ingresa tu contraseña actual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
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
              name="newPassword"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field className="grid gap-2">
                    <FieldLabel>Nueva Contraseña</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="password"
                        type={showNewPassword ? "text" : "password"}
                        aria-invalid={fieldState.invalid}
                        placeholder="Ingresa tu nueva contraseña"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
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
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field className="grid gap-2">
                    <FieldLabel>Confirmar Nueva Contraseña</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="password"
                        type={showConfirmPassword ? "text" : "password"}
                        aria-invalid={fieldState.invalid}
                        placeholder="Confirma tu nueva contraseña"
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
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit">Cambiar Contraseña</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePassword;
