import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Rol, Usuario } from "../types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { validateDateFormat } from "@/lib/dates";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "sonner";
import { MessageInterpreter } from "@/lib/messageInterpreter";
import { print } from "@/lib/print";
import dayjs from "dayjs";
import { DatePickerSimple } from "@/components/DatePickerSimple";

interface AgregarEditarUsuarioModalProps {
  usuario: Usuario | null;
  roles: Rol[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  nombres: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  primerApellido: z.string().min(2, {
    message: "El primer apellido debe tener al menos 2 caracteres.",
  }),
  segundoApellido: z.string().optional(),
  nroDocumento: z.string().min(5, {
    message: "El número de documento debe tener al menos 5 caracteres.",
  }),
  fechaNacimiento: z.string().refine(
    (date) => {
      return validateDateFormat(date, "YYYY-MM-DD");
    },
    { message: "Fecha de nacimiento inválida" },
  ),
  correoElectronico: z
    .string()
    .email({ message: "Correo electrónico inválido" }),
  roles: z.array(z.string()).min(1, {
    message: "Seleccione al menos un rol",
  }),
});

export function AgregarEditarUsuarioModal({
  usuario,
  isOpen,
  roles,
  onClose,
  onSuccess,
}: AgregarEditarUsuarioModalProps) {
  const { sessionRequest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: usuario
      ? {
          nombres: usuario.persona.nombres,
          primerApellido: usuario.persona.primerApellido,
          segundoApellido: usuario.persona.segundoApellido,
          nroDocumento: usuario.persona.nroDocumento,
          fechaNacimiento:
            dayjs.utc(usuario.persona.fechaNacimiento).format("YYYY-MM-DD") ||
            "",
          correoElectronico: usuario.correoElectronico,
          roles: usuario.usuarioRol.map((rol) => rol.rol.id),
        }
      : {
          nombres: "",
          primerApellido: "",
          segundoApellido: "",
          nroDocumento: "",
          fechaNacimiento: "",
          correoElectronico: "",
          roles: [],
        },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.warn({ values });
    setIsLoading(true);
    try {
      const url = usuario ? `/usuarios/${usuario.id}` : "/usuarios";
      const method = usuario ? "PATCH" : "POST";
      const resultado = await sessionRequest({
        url,
        method,
        data: {
          correoElectronico: values.correoElectronico,
          roles: values.roles,
          persona: {
            nombres: values.nombres,
            primerApellido: values.primerApellido,
            segundoApellido: values.segundoApellido,
            nroDocumento: values.nroDocumento,
            fechaNacimiento: values.fechaNacimiento,
          },
        },
      });

      toast.success(usuario ? "Usuario actualizado" : "Usuario creado", {
        description: MessageInterpreter(resultado?.data),
      });

      onSuccess();
      onClose();
    } catch (error) {
      print("Error al guardar usuario", error);
      toast.error(
        usuario ? "Error al actualizar usuario" : "Error al crear usuario",
        { description: MessageInterpreter(error) },
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {usuario ? "Editar Usuario" : "Agregar Usuario"}
          </DialogTitle>
          <DialogDescription>
            {usuario
              ? "Modifica los datos del usuario y guarda los cambios cuando hayas terminado."
              : "Ingresa los datos del nuevo usuario y haz clic en Guardar."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <h4 className="scroll-m-20 text-base font-semibold tracking-tight">
              Información personal
            </h4>
            <div className="flex flex-wrap space-y-2 pt-4">
              <Controller
                name="nombres"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field
                      aria-invalid={fieldState.invalid}
                      className="w-full p-0 md:w-6/12 md:pr-2"
                    >
                      <FieldLabel>Nombres</FieldLabel>
                      <Input
                        id="nombres"
                        placeholder="Ingrese sus nombres"
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
              <Controller
                name="primerApellido"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field
                      aria-invalid={fieldState.invalid}
                      className="w-full p-0 md:w-6/12 md:pl-2"
                    >
                      <FieldLabel>Primer Apellido</FieldLabel>
                      <Input
                        id="primerApellido"
                        placeholder="Ingrese su primer apellido"
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
              <Controller
                name="segundoApellido"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field
                      aria-invalid={fieldState.invalid}
                      className="w-full p-0 md:w-6/12 md:pr-2"
                    >
                      <FieldLabel>Segundo Apellido</FieldLabel>
                      <Input
                        id="segundoApellido"
                        placeholder="Ingrese su segundo apellido"
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
              <Controller
                name="fechaNacimiento"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field
                      aria-invalid={fieldState.invalid}
                      className="w-full p-0 md:w-6/12 md:pl-2"
                    >
                      <DatePickerSimple
                        label="Fecha Nacimiento"
                        value={field.value || undefined}
                        onChange={(date) => {
                          field.onChange(date || "");
                        }}
                        invalid={fieldState.invalid}
                        error={fieldState.error}
                      />
                    </Field>
                  );
                }}
              />
              <Controller
                name="nroDocumento"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field
                      aria-invalid={fieldState.invalid}
                      className="w-full p-0 md:w-6/12 md:pr-2"
                    >
                      <FieldLabel>Nro. Documento</FieldLabel>
                      <Input
                        id="nroDocumento"
                        placeholder="Ingrese Cedula de Identidad"
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
            </div>
          </div>
          <Separator className="my-6" />
          <div>
            <h4 className="scroll-m-20 text-base font-semibold tracking-tight">
              Información de contacto
            </h4>
            <div className="flex flex-wrap space-y-2 pt-4">
              <Controller
                name="correoElectronico"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field aria-invalid={fieldState.invalid} className="w-full">
                      <FieldLabel>Correo Electrónico</FieldLabel>
                      <Input
                        id="correoElectronico"
                        placeholder="Ingrese su correo electrónico"
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
            </div>
          </div>
          <Separator className="my-6" />
          <div>
            <h4 className="scroll-m-20 text-base font-semibold tracking-tight">
              Información de usuario
            </h4>
            <div className="flex flex-wrap space-y-2 pt-4">
              <Controller
                name="roles"
                control={form.control}
                render={({ fieldState }) => {
                  return (
                    <Field aria-invalid={fieldState.invalid} className="w-full">
                      <FieldLabel>Roles</FieldLabel>
                      <div className="space-y-2">
                        {roles.map((role) => (
                          <div
                            key={role.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={role.id}
                              checked={form.watch("roles").includes(role.id)}
                              onCheckedChange={(checked) => {
                                const currentRoles = form.watch("roles");
                                if (checked) {
                                  form.setValue("roles", [
                                    ...currentRoles,
                                    role.id,
                                  ]);
                                } else {
                                  form.setValue(
                                    "roles",
                                    currentRoles.filter((id) => id !== role.id),
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={role.id}>{role.nombre}</Label>
                          </div>
                        ))}
                      </div>
                    </Field>
                  );
                }}
              />
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant={"outline"}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : usuario ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
