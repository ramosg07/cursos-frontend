"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthProvider";
import { Estudiante } from "../types";
import { toast } from "sonner";

interface Props {
  estudiante: Estudiante | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ActivarInactivarEstudianteModal({
  estudiante,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { sessionRequest } = useAuth();

  if (!estudiante) return null;

  const isActivating = estudiante.estado !== "ACTIVO";
  const actionLabel = isActivating ? "activar" : "inactivar";

  const handleConfirm = async () => {
    try {
      const url = `/estudiantes/${estudiante.id}/${isActivating ? "activar" : "inactivar"}`;
      await sessionRequest({
        url,
        method: "patch",
      });

      toast.success(
        `Estudiante ${isActivating ? "activado" : "inactivado"} correctamente`,
      );
      onSuccess();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.mensaje || "Error al cambiar el estado",
      );
    } finally {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Está seguro de {actionLabel} al estudiante?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción cambiará el estado del estudiante{" "}
            <strong>
              {estudiante.usuario.persona.nombres}{" "}
              {estudiante.usuario.persona.primerApellido}
            </strong>{" "}
            a {isActivating ? "ACTIVO" : "INACTIVO"}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
