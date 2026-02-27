"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { Curso } from "../types";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { MessageInterpreter } from "@/lib/messageInterpreter";
import { print } from "@/lib/print";

interface ActivarInactivarCursoModalProps {
  curso: Curso | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ActivarInactivarCursoModal({
  curso,
  isOpen,
  onClose,
  onSuccess,
}: ActivarInactivarCursoModalProps) {
  const { sessionRequest } = useAuth();

  const handleActivarInactivar = async () => {
    if (!curso) return;

    try {
      const result = await sessionRequest({
        url: `/cursos/${curso.id}/${
          curso.estado === "ACTIVO" ? "inactivar" : "activar"
        }`,
        method: "PATCH",
      });
      toast.success("Curso actualizado", {
        description: MessageInterpreter(result?.data),
      });
      onSuccess();
    } catch (error) {
      print("Error al activar/inactivar curso", error);
      toast.error("Error al actualizar curso", {
        description: MessageInterpreter(error),
      });
    } finally {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {curso?.estado === "ACTIVO" ? "Inactivar" : "Activar"} curso
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de{" "}
            {curso?.estado === "ACTIVO" ? "inactivar" : "activar"} el curso{" "}
            <strong>{curso?.nombre}</strong>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleActivarInactivar}>
            {curso?.estado === "ACTIVO" ? "Inactivar" : "Activar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
