import * as z from "zod";
import { Aula, usePrefasApi } from "../../services/prefas.api";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { print } from "@/lib/print";

interface AgregarEditarAulaModalProps {
  aula: Aula | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z
  .object({
    nombre: z
      .string("El campo nombre es requerido")
      .min(1, "El nombre debe tener al menos 5 caracteres."),
    piso: z.string("El campo piso es requerido").min(1, {
      message: "El piso debe tener al menos 1 caracteres.",
    }),
    columnaInicio: z
      .string("El campo columna inicio es requerido")
      .length(1, {
        message: "La columna inicio debe tener 1 caracter.",
      })
      .regex(/^[A-Z]$/i, "Debe ingresar una letra de la A a la Z"),
    columnaFin: z
      .string("El campo columna fin es requerido")
      .length(1, {
        message: "La columna fin debe tener 1 caracter.",
      })
      .regex(/^[A-Z]$/i, "Debe ingresar una letra de la A a la Z"),
    filas: z.number().min(1, "El precio debe ser mayor a 0"),
  })
  .superRefine((data, ctx) => {
    const inicio = data.columnaInicio.toUpperCase().charCodeAt(0);
    const fin = data.columnaFin.toUpperCase().charCodeAt(0);

    if (fin < inicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["columnaFin"],
        message:
          "La columna final debe ser mayor o igual a la columna inicial.",
      });
    }
  });

export function AgregarEditarAulaModal({
  aula,
  isOpen,
  onClose,
  onSuccess,
}: AgregarEditarAulaModalProps) {
  const api = usePrefasApi();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: aula
      ? {
          nombre: aula.nombre || "",
          piso: aula.piso || "",
          columnaInicio: aula.columnaInicio || "",
          columnaFin: aula.columnaFin || "",
          filas: aula.filas || 0,
        }
      : {
          nombre: "",
          piso: "",
          columnaInicio: "",
          columnaFin: "",
          filas: 0,
        },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (aula) {
        await api.updateAula(aula.id, values);
        toast.info("Actualización correctamente");
      } else {
        await api.createAula(values);
        toast.success("Aula registrado correctamente");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      print("Error al guardar aula", error);
      toast.error(error?.message || "Ocurrió un error al guardar el aula");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{aula ? "Editar Aula" : "Registrar Aula"}</DialogTitle>
          <DialogDescription>
            {aula
              ? "Modifica los datos del aula y guarda los cambios."
              : "Ingresa los datos del nuevo aula."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="nombre"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field aria-invalid={fieldState.invalid} className="w-full">
                <FieldLabel>Nombre</FieldLabel>
                <Input
                  id="nombre"
                  placeholder="Ingrese el nombre del aula"
                  {...field}
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="piso"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field aria-invalid={fieldState.invalid} className="w-full">
                <FieldLabel>Piso</FieldLabel>
                <Input
                  id="piso"
                  placeholder="Ingrese el piso del aula"
                  {...field}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className="flex w-full gap-4">
            <Controller
              name="columnaInicio"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-invalid={fieldState.invalid} className="w-full">
                  <FieldLabel>Columna inicio</FieldLabel>
                  <Input
                    id="columnaInicio"
                    placeholder="Ingrese el columna inicio del aula"
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
              name="columnaFin"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-invalid={fieldState.invalid} className="w-full">
                  <FieldLabel>Columna fin</FieldLabel>
                  <Input
                    id="columnaFin"
                    placeholder="Ingrese el columna fin del aula"
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
          </div>
          <Controller
            name="filas"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field aria-invalid={fieldState.invalid} className="w-full">
                <FieldLabel>Filas</FieldLabel>
                <Input
                  id="filas"
                  type="number"
                  placeholder="Filas"
                  {...field}
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <div className="flex w-full justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : aula ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
