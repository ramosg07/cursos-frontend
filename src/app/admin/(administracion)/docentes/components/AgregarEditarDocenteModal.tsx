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
import { Docente } from "../types";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { MessageInterpreter } from "@/lib/messageInterpreter";

const teacherSchema = z.object({
  nroDocumento: z.string().min(5, "Mínimo 5 caracteres"),
  nombres: z.string().min(2, "Mínimo 2 caracteres"),
  primerApellido: z.string().min(2, "Mínimo 2 caracteres"),
  segundoApellido: z.string().optional().nullable(),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

interface Props {
  docente: Docente | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AgregarEditarDocenteModal({
  docente,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { sessionRequest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!docente;

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      nroDocumento: "",
      nombres: "",
      primerApellido: "",
      segundoApellido: "",
    },
  });

  useEffect(() => {
    if (docente) {
      const p = docente.usuario.persona;
      form.reset({
        nroDocumento: p.nroDocumento,
        nombres: p.nombres,
        primerApellido: p.primerApellido,
        segundoApellido: p.segundoApellido ?? "",
      });
    } else {
      form.reset({
        nroDocumento: "",
        nombres: "",
        primerApellido: "",
        segundoApellido: "",
      });
    }
  }, [docente, form]);

  const onSubmit = async (values: TeacherFormValues) => {
    setIsLoading(true);
    try {
      const url = isEditing ? `/docentes/${docente.id}` : "/docentes";
      const method = isEditing ? "PATCH" : "POST";
      const body = {
        segundoApellido: values.segundoApellido || null,
        nombres: values.nombres,
        primerApellido: values.primerApellido,
        nroDocumento: !docente ? values.nroDocumento : undefined,
      };
      const resultado = await sessionRequest({
        url,
        method,
        data: body,
      });

      toast.success(
        `Docente ${isEditing ? "actualizado" : "creado"} correctamente`,
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
            {isEditing ? "Editar Docente" : "Nuevo Docente"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  onChange={(e) =>
                    field.onChange(e.target.value.toUpperCase())
                  }
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

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
                  onChange={(e) =>
                    field.onChange(e.target.value.toUpperCase())
                  }
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
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
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
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

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
                  : "Crear Docente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
