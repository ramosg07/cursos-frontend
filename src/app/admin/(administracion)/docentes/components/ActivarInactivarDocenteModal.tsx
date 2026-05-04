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
import { Docente } from "../types";
import { toast } from "sonner";

interface Props {
  docente: Docente | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ActivarInactivarDocenteModal({
  docente,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { sessionRequest } = useAuth();

  if (!docente) return null;

  const isActivating = docente.estado !== "ACTIVO";
  const actionLabel = isActivating ? "activar" : "inactivar";

  const handleConfirm = async () => {
    try {
      const url = `/docentes/${docente.id}/${isActivating ? "activar" : "inactivar"}`;
      await sessionRequest({
        url,
        method: "patch",
      });

      toast.success(
        `Docente ${isActivating ? "activado" : "inactivado"} correctamente`,
      );
      onSuccess();
    } catch (error: any) {
      const errorMessage = error?.message;
      toast.error(
        Array.isArray(errorMessage)
          ? errorMessage[0]
          : errorMessage || "Error al cambiar el estado",
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
            ¿Está seguro de {actionLabel} al docente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción cambiará el estado del docente{" "}
            <strong>
              {docente.usuario.persona.nombres}{" "}
              {docente.usuario.persona.primerApellido}
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
