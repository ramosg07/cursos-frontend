import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { print } from "@/lib/print";
import { Postulante, usePrefasApi } from "../../services/prefas.api";

interface AgregarEditarPostulanteModalProps {
  postulante: Postulante | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  nroDocumento: z.string().min(5, "Mínimo 5 caracteres"),
  nombres: z.string("El campo nombres es requerido").min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  primerApellido: z.string().optional(),
  segundoApellido: z.string().optional(),
  celular: z.string().optional(),
});

export function AgregarEditarPostulanteModal({
  postulante,
  isOpen,
  onClose,
  onSuccess,
}: AgregarEditarPostulanteModalProps) {
  const api = usePrefasApi();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: postulante
      ? {
          nroDocumento: postulante.nroDocumento || "",
          nombres: postulante.nombres || "",
          primerApellido: postulante.primerApellido || "",
          segundoApellido: postulante.segundoApellido || "",
          celular: postulante.celular || "",
        }
      : {
          nroDocumento: "",
          nombres: "",
          primerApellido: "",
          segundoApellido: "",
          celular: "",
        },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (postulante) {
        await api.updatePostulante(postulante.id, values);
        toast.info(
          "Actualización no implementada en API aún, simulando éxito.",
        );
      } else {
        await api.createPostulante(values);
        toast.success("Postulante registrado correctamente");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      print("Error al guardar postulante", error);
      toast.error(
        error?.message || "Ocurrió un error al guardar el postulante",
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
            {postulante ? "Editar Postulante" : "Registrar Postulante"}
          </DialogTitle>
          <DialogDescription>
            {postulante
              ? "Modifica los datos del postulante y guarda los cambios."
              : "Ingresa los datos del nuevo postulante."}
          </DialogDescription>
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
            name="nombres"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field aria-invalid={fieldState.invalid} className="w-full p-0">
                <FieldLabel>Nombres *</FieldLabel>
                <Input
                  id="nombres"
                  placeholder="Ej. Juan Carlos"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="primerApellido"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field aria-invalid={fieldState.invalid} className="w-full p-0">
                <FieldLabel>Primer Apellido</FieldLabel>
                <Input
                  id="primerApellido"
                  placeholder="Ej. Pérez"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
              <Field aria-invalid={fieldState.invalid} className="w-full p-0">
                <FieldLabel>Segundo Apellido</FieldLabel>
                <Input
                  id="segundoApellido"
                  placeholder="Ej. Gómez"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="celular"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field aria-invalid={fieldState.invalid} className="w-full p-0">
                <FieldLabel>Celular</FieldLabel>
                <Input
                  id="celular"
                  placeholder="Ej. 78945612"
                  {...field}
                  aria-invalid={fieldState.invalid}
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
              {isLoading ? "Guardando..." : postulante ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
