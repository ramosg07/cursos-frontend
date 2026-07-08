import { ProductoPrefa, usePrefasApi } from "../../services/prefas.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { print } from "@/lib/print";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AgregarEditarProductoModalProps {
  producto: ProductoPrefa | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  nombre: z
    .string("El campo nombres es requerido")
    .min(5, "El nombre debe tener al menos 5 caracteres."),
  descripcion: z.string("El campo nombres es requerido").min(5, {
    message: "La descripción debe tener al menos 2 caracteres.",
  }),
  precio: z.number().min(1, "El precio debe ser mayor a 0"),
  stock: z.number().min(1, "El stock debe ser mayor a 0"),
  tipo: z.enum(["CURSO", "PRODUCTO"]),
});

export function AgregarEditarProductoModal({
  producto,
  isOpen,
  onClose,
  onSuccess,
}: AgregarEditarProductoModalProps) {
  const api = usePrefasApi();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: producto
      ? {
          nombre: producto.nombre || "",
          descripcion: producto.descripcion || "",
          precio: Number(producto.precio) || 0,
          stock: Number(producto.stock) || 0,
          tipo: producto.tipo || "PRODUCTO",
        }
      : {
          nombre: "",
          descripcion: "",
          precio: 0,
          stock: 0,
          tipo: "PRODUCTO",
        },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (producto) {
        await api.updateProducto(producto.id, values);
        toast.info(
          "Actualización no implementada en API aún, simulando éxito.",
        );
      } else {
        await api.createProducto(values);
        toast.success("Producto registrado correctamente");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      print("Error al guardar producto", error);
      toast.error(error?.message || "Ocurrió un error al guardar el producto");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {producto ? "Editar Producto" : "Registrar Producto"}
          </DialogTitle>
          <DialogDescription>
            {producto
              ? "Modifica los datos del producto y guarda los cambios."
              : "Ingresa los datos del nuevo producto."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="tipo"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field aria-invalid={fieldState.invalid}>
                <FieldLabel>Tipo</FieldLabel>

                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PRODUCTO" id="producto" />
                    <Label htmlFor="producto">Producto</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CURSO" id="curso" />
                    <Label htmlFor="curso">Curso</Label>
                  </div>
                </RadioGroup>

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="nombre"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field aria-invalid={fieldState.invalid} className="w-full">
                <FieldLabel>Nombre</FieldLabel>
                <Input
                  id="nombre"
                  placeholder="Ingrese el nombre del producto"
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
          <div className="flex w-full gap-4">
            <Controller
              name="precio"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-invalid={fieldState.invalid} className="w-full">
                  <FieldLabel>Precio (Bs.)</FieldLabel>
                  <Input
                    id="precio"
                    type="number"
                    placeholder="Precio (Bs.)"
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
            <Controller
              name="stock"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field aria-invalid={fieldState.invalid} className="w-full">
                  <FieldLabel>Stock</FieldLabel>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="Stock"
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
          </div>
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
              {isLoading ? "Guardando..." : producto ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
