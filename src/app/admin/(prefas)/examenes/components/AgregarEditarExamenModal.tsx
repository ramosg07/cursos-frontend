import * as z from "zod";
import { Examen, usePrefasApi } from "../../services/prefas.api";
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
import dayjs from "dayjs";
import { validateDateFormat } from "@/lib/dates";
import { DatePickerSimple } from "@/components/DatePickerSimple";

interface AgregarEditarExamenModalProps {
  examen: Examen | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  nombre: z
    .string("El campo nombre es requerido")
    .min(1, "El nombre debe tener al menos 5 caracteres."),
  fecha: z
    .string()
    .optional()
    .nullable()
    .refine(
      (date) => {
        if (!dayjs.utc(date).isValid) return true; // permite null o undefined
        return validateDateFormat(dayjs.utc(date).toString(), "YYYY-MM-DD");
      },
      { message: "Fecha inicio inválida" },
    ),
});

export function AgregarEditarExamenModal({
  examen,
  isOpen,
  onClose,
  onSuccess,
}: AgregarEditarExamenModalProps) {
  const api = usePrefasApi();

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: examen
      ? {
          nombre: examen.nombre || "",
          fecha: dayjs.utc(examen.fecha).format("YYYY-MM-DD") || "",
        }
      : {
          nombre: "",
          fecha: "",
        },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (examen) {
        await api.updateExamen(examen.id, values);
        toast.info("Actualización correctamente");
      } else {
        await api.createExamen(values);
        toast.success("Examen registrado correctamente");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      print("Error al guardar examen", error);
      toast.error(error?.message || "Ocurrió un error al guardar el examen");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {examen ? "Editar Examen" : "Registrar Examen"}
          </DialogTitle>
          <DialogDescription>
            {examen
              ? "Modifica los datos del examen y guarda los cambios."
              : "Ingresa los datos del nuevo examen."}
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
                  placeholder="Ingrese el nombre del examen"
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
            name="fecha"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <Field
                  aria-invalid={fieldState.invalid}
                  className="w-full p-0 md:pr-2"
                >
                  <DatePickerSimple
                    label="Fecha"
                    value={
                      dayjs.utc(field.value).isValid()
                        ? (field.value ?? "")
                        : undefined
                    }
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
              {isLoading ? "Guardando..." : examen ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
