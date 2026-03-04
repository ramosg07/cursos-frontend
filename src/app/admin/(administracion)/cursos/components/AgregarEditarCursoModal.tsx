"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Curso, UsuarioCoordinador } from "../types";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Plus, Trash2 } from "lucide-react";

interface AgregarEditarCursoModalProps {
  curso: Curso | null;
  coordinadoresDisponibles: UsuarioCoordinador[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  descripcion: z.string().optional(),
  fechaInicio: z.string().optional().nullable(),
  fechaFin: z.string().optional().nullable(),
  coordinadores: z.array(z.string()).optional(),
  paralelos: z.array(
    z.object({
      id: z.string().optional(),
      nombre: z.string().min(1, "El nombre es obligatorio"),
      cupo: z.coerce.number().min(1, "El cupo debe ser al menos 1"),
    }),
  ),
});

type FormValues = z.infer<typeof formSchema>;

export function AgregarEditarCursoModal({
  curso,
  isOpen,
  coordinadoresDisponibles,
  onClose,
  onSuccess,
}: AgregarEditarCursoModalProps) {
  const { sessionRequest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const coordinadoresActivos = curso
    ? curso.cursoCoordinador
        .filter((cc) => cc.estado === "ACTIVO")
        .map((cc) => cc.idUsuario)
    : [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: curso
      ? {
          nombre: curso.nombre,
          descripcion: curso.descripcion ?? "",
          fechaInicio: curso.fechaInicio ?? "",
          fechaFin: curso.fechaFin ?? "",
          coordinadores: coordinadoresActivos,
          paralelos: (curso.paralelos || [])
            .filter((p) => p.estado === "ACTIVO")
            .map((p) => ({
              id: p.id,
              nombre: p.nombre,
              cupo: p.cupo,
            })),
        }
      : {
          nombre: "",
          descripcion: "",
          fechaInicio: "",
          fechaFin: "",
          coordinadores: [],
          paralelos: [{ nombre: "A", cupo: 30 }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "paralelos",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const url = curso ? `/cursos/${curso.id}` : "/cursos";
      const method = curso ? "PATCH" : "POST";
      const resultado = await sessionRequest({
        url,
        method,
        data: {
          nombre: values.nombre,
          descripcion: values.descripcion || null,
          fechaInicio: values.fechaInicio || null,
          fechaFin: values.fechaFin || null,
          coordinadores: values.coordinadores ?? [],
          paralelos: values.paralelos ?? [],
        },
      });

      toast.success(curso ? "Curso actualizado" : "Curso creado", {
        description: MessageInterpreter(resultado?.data),
      });

      onSuccess();
      onClose();
    } catch (error) {
      print("Error al guardar curso", error);
      toast.error(
        curso ? "Error al actualizar curso" : "Error al crear curso",
        {
          description: MessageInterpreter(error),
        },
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{curso ? "Editar Curso" : "Agregar Curso"}</DialogTitle>
          <DialogDescription>
            {curso
              ? "Modifica los datos del curso y guarda los cambios cuando hayas terminado."
              : "Ingresa los datos del nuevo curso y haz clic en Guardar."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Información del curso */}
          <div>
            <h4 className="scroll-m-20 text-base font-semibold tracking-tight">
              Información del curso
            </h4>
            <div className="flex flex-wrap space-y-2 pt-4">
              <Controller
                name="nombre"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field aria-invalid={fieldState.invalid} className="w-full">
                    <FieldLabel>Nombre</FieldLabel>
                    <Input
                      id="nombre"
                      placeholder="Ingrese el nombre del curso"
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
                name="descripcion"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field aria-invalid={fieldState.invalid} className="w-full">
                    <FieldLabel>Descripción</FieldLabel>
                    <Input
                      id="descripcion"
                      placeholder="Ingrese una descripción (opcional)"
                      {...field}
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="fechaInicio"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    aria-invalid={fieldState.invalid}
                    className="w-full p-0 md:w-6/12 md:pr-2"
                  >
                    <FieldLabel>Fecha de Inicio</FieldLabel>
                    <Input
                      id="fechaInicio"
                      type="date"
                      {...field}
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="fechaFin"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    aria-invalid={fieldState.invalid}
                    className="w-full p-0 md:w-6/12 md:pl-2"
                  >
                    <FieldLabel>Fecha de Fin</FieldLabel>
                    <Input
                      id="fechaFin"
                      type="date"
                      {...field}
                      value={field.value ?? ""}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </div>
          <Separator className="my-6" />
          {/* Coordinadores de curso */}
          <div>
            <h4 className="scroll-m-20 text-base font-semibold tracking-tight">
              Coordinadores de Curso
            </h4>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Selecciona los usuarios con rol Coordinador de Curso que atenderán
              este curso.
            </p>
            <Controller
              name="coordinadores"
              control={form.control}
              render={({ fieldState }) => (
                <Field aria-invalid={fieldState.invalid} className="w-full">
                  {coordinadoresDisponibles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay coordinadores de curso disponibles.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {coordinadoresDisponibles.map((coordinador) => (
                        <div
                          key={coordinador.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`coord-${coordinador.id}`}
                            checked={
                              form
                                .watch("coordinadores")
                                ?.includes(coordinador.id) ?? false
                            }
                            onCheckedChange={(checked) => {
                              const currentCoords =
                                form.watch("coordinadores") ?? [];
                              if (checked) {
                                form.setValue("coordinadores", [
                                  ...currentCoords,
                                  coordinador.id,
                                ]);
                              } else {
                                form.setValue(
                                  "coordinadores",
                                  currentCoords.filter(
                                    (id) => id !== coordinador.id,
                                  ),
                                );
                              }
                            }}
                          />
                          <Label htmlFor={`coord-${coordinador.id}`}>
                            {coordinador.persona.nombres}{" "}
                            {coordinador.persona.primerApellido}{" "}
                            {coordinador.persona.segundoApellido ?? ""}
                            <span className="text-muted-foreground ml-1 text-xs">
                              ({coordinador.usuario})
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <Separator className="my-6" />

          {/* Gestión de Paralelos */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="scroll-m-20 text-base font-semibold tracking-tight">
                  Paralelos y Cupos
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Define las secciones (paralelos) y el cupo máximo para cada
                  uno.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ nombre: "", cupo: 30 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Paralelo
              </Button>
            </div>

            <div className="space-y-3 mt-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-2 items-end border p-3 rounded-md bg-muted/20 relative group"
                >
                  <Controller
                    name={`paralelos.${index}.nombre`}
                    control={form.control}
                    render={({ field: inputField, fieldState }) => (
                      <Field className="flex-1">
                        <FieldLabel className="text-xs">Nombre</FieldLabel>
                        <Input
                          placeholder="Ej: A, B..."
                          {...inputField}
                          className="h-9"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name={`paralelos.${index}.cupo`}
                    control={form.control}
                    render={({ field: inputField, fieldState }) => (
                      <Field className="w-24">
                        <FieldLabel className="text-xs">Cupo</FieldLabel>
                        <Input
                          type="number"
                          placeholder="Cupo"
                          {...inputField}
                          className="h-9"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {fields.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4 border-2 border-dashed rounded-md">
                  Debes agregar al menos un paralelo.
                </p>
              )}
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
              {isLoading ? "Guardando..." : curso ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
