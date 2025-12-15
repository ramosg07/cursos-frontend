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
import { Constants } from "@/config/Constants";
import { useAuth } from "@/contexts/AuthProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { print } from "@/lib/print";
import { toast } from "sonner";
import { MessageInterpreter } from "@/lib/messageInterpreter";

const formSchema = z.object({
  nombres: z.string().min(1, "El nombre es requerido"),
  primerApellido: z.string().min(1, "El primer apellido es requerido"),
  segundoApellido: z.string().optional(),
  correoElectronico: z.string().email("Correo electrónico inválido"),
  telefono: z
    .string()
    .nullable() // Permitir que el teléfono sea null
    .refine(
      (value) => value === null || value === "" || /^[6-7]\d{7}$/.test(value),
      { message: "Debe ser un teléfono válido" }
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ isOpen, onClose }) => {
  const { user, sessionRequest, updateProfile } = useAuth();

  const {
    formState: { isSubmitting },
    ...form
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombres: user?.persona.nombres || "",
      primerApellido: user?.persona.primerApellido || "",
      segundoApellido: user?.persona.segundoApellido || "",
      correoElectronico: user?.correoElectronico || "",
      telefono: user?.persona.telefono || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await sessionRequest({
        url: `${Constants.baseUrl}/usuarios/cuenta/perfil`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          correoElectronico: values.correoElectronico,
          telefono: values.telefono === "" ? null : values.telefono,
        },
      });
      await updateProfile();
      onClose();
    } catch (error) {
      print("Error updating profile:", error);
      toast.error("Error", {
        description: MessageInterpreter(error),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal aquí. Haz clic en guardar cuando
            hayas terminado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <FieldGroup className="gap-4">
            <Controller
              name="nombres"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field className="grid gap-2">
                    <FieldLabel>Nombres</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="nombres"
                        aria-invalid={fieldState.invalid}
                        disabled
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
                  <Field className="grid gap-2">
                    <FieldLabel>Primer Apellido</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="primerApellido"
                        aria-invalid={fieldState.invalid}
                        disabled
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
                  <Field className="grid gap-2">
                    <FieldLabel>Segundo Apellido</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="segundoApellido"
                        aria-invalid={fieldState.invalid}
                        disabled
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
              name="correoElectronico"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field className="grid gap-2">
                    <FieldLabel>Correo Electrónico</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="correoElectronico"
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
                  <Field className="grid gap-2">
                    <FieldLabel>Teléfono</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="telefono"
                        type={"tel"}
                        aria-invalid={fieldState.invalid}
                        value={field.value ?? ""}
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
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;
