"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { Estudiante } from "../types";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { MessageInterpreter } from "@/lib/messageInterpreter";
import dayjs from "dayjs";

const studentSchema = z.object({
  nroDocumento: z.string().min(5, "Mínimo 5 caracteres"),
  nombres: z.string().min(2, "Mínimo 2 caracteres"),
  primerApellido: z.string().min(2, "Mínimo 2 caracteres"),
  segundoApellido: z.string().optional().nullable(),
  correoElectronico: z.string().email("Correo inválido"),
  codigoPersonal: z.string().optional().nullable(),
  fechaNacimiento: z.string().optional().nullable(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface Props {
  estudiante: Estudiante | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AgregarEditarEstudianteModal({
  estudiante,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { sessionRequest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!estudiante;

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      nroDocumento: "",
      nombres: "",
      primerApellido: "",
      segundoApellido: "",
      correoElectronico: "",
      codigoPersonal: "",
      fechaNacimiento: "",
    },
  });

  useEffect(() => {
    if (estudiante) {
      const p = estudiante.usuario.persona;
      form.reset({
        nroDocumento: p.nroDocumento,
        nombres: p.nombres,
        primerApellido: p.primerApellido,
        segundoApellido: p.segundoApellido ?? "",
        correoElectronico: estudiante.usuario.correoElectronico,
        codigoPersonal: estudiante.codigoPersonal ?? "",
        fechaNacimiento: estudiante.usuario.persona.fechaNacimiento
          ? dayjs(estudiante.usuario.persona.fechaNacimiento).format(
              "YYYY-MM-DD",
            )
          : "",
      });
    } else {
      form.reset({
        nroDocumento: "",
        nombres: "",
        primerApellido: "",
        segundoApellido: "",
        correoElectronico: "",
        codigoPersonal: "",
        fechaNacimiento: "",
      });
    }
  }, [estudiante, form]);

  const onSubmit = async (values: StudentFormValues) => {
    setIsLoading(true);
    try {
      const url = isEditing ? `/estudiantes/${estudiante.id}` : "/estudiantes";
      const method = isEditing ? "PATCH" : "POST";
      const body = {
        codigoPersonal: values.codigoPersonal || null,
        segundoApellido: values.segundoApellido || null,
        correoElectronico: values.correoElectronico,
        nombres: values.nombres,
        primerApellido: values.primerApellido,
        fechaNacimiento: values.fechaNacimiento || null,
        nroDocumento: !estudiante ? values.nroDocumento : undefined,
      };
      const resultado = await sessionRequest({
        url,
        method,
        data: body,
      });

      toast.success(
        `Estudiante ${isEditing ? "actualizado" : "creado"} correctamente`,
        { description: MessageInterpreter(resultado?.data) },
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Error al procesar la solicitud", {
        description: MessageInterpreter(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Estudiante" : "Nuevo Estudiante"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="nroDocumento"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-invalid={fieldState.invalid}>
                  <FieldLabel>Documento (CI)</FieldLabel>
                  <Input
                    placeholder="1234567"
                    {...field}
                    disabled={isEditing}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="codigoPersonal"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-invalid={fieldState.invalid}>
                  <FieldLabel>Código/Matrícula</FieldLabel>
                  <Input
                    placeholder="EST-001"
                    {...field}
                    value={field.value || ""}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="nombres"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field aria-invalid={fieldState.invalid}>
                <FieldLabel>Nombres</FieldLabel>
                <Input
                  placeholder="Juan"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="primerApellido"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-invalid={fieldState.invalid}>
                  <FieldLabel>Primer Apellido</FieldLabel>
                  <Input
                    placeholder="Perez"
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="segundoApellido"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-invalid={fieldState.invalid}>
                  <FieldLabel>Segundo Apellido</FieldLabel>
                  <Input
                    placeholder="Gomez"
                    {...field}
                    value={field.value || ""}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="correoElectronico"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field aria-invalid={fieldState.invalid}>
                <FieldLabel>Correo Electrónico</FieldLabel>
                <Input
                  placeholder="juan.perez@example.com"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="fechaNacimiento"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field aria-invalid={fieldState.invalid}>
                <FieldLabel>Fecha de Nacimiento</FieldLabel>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ""}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Guardando..."
                : isEditing
                  ? "Guardar Cambios"
                  : "Crear Estudiante"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
