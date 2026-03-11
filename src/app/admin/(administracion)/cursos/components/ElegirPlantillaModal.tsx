import { Curso } from "../types";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlantillaCertificadoResponse } from "../../certificados/types";
import { useAuth } from "@/contexts/AuthProvider";
import { MessageInterpreter } from "@/lib/messageInterpreter";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface ElegirPlantillaModalProps {
  curso: Curso | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  plantilla: z.string("Seleccione una plantilla").min(1),
});

type FormValues = z.infer<typeof formSchema>;

export function ElegirPlantillaModal({
  curso,
  isOpen,
  onClose,
  onSuccess,
}: ElegirPlantillaModalProps) {
  console.warn({ curso });
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plantilla: (curso && curso?.idPlantillaCertificado) || "",
    },
  });

  const { sessionRequest } = useAuth();

  const onSubmit = async (values: FormValues) => {
    console.warn({ values });
    try {
      setIsLoading(true);
      const response = await sessionRequest({
        url: `/cursos/${curso?.id}/plantilla-certificado`,
        method: "POST",
        data: {
          idPlantillaCertificado: values.plantilla,
        },
      });
      toast.success("Plantilla del curso actualizada", {
        description: MessageInterpreter(response?.data),
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Error al guardar plantilla del curso", {
        description: MessageInterpreter(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { data: plantillas } = useQuery({
    queryKey: ["plantillas-certificados"],
    queryFn: async () => {
      const response = await sessionRequest<PlantillaCertificadoResponse>({
        url: "/plantillas-certificados/todo",
        method: "get",
      });
      return response?.data.datos ?? [];
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{"Elegir Plantilla"}</DialogTitle>
          <DialogDescription>
            {"Seleccione una plantilla de certificados para el curso"}{" "}
            {curso?.nombre}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Información del curso */}
          <div className="flex flex-wrap space-y-2 pt-4">
            <Controller
              name="plantilla"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-invalid={fieldState.invalid} className="w-full">
                  <FieldLabel>Plantilla</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="plantilla">
                      <SelectValue placeholder="Seleccionar plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(plantillas ?? []).map((plantilla) => (
                          <SelectItem key={plantilla.id} value={plantilla.id}>
                            {plantilla.nombre}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
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
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
