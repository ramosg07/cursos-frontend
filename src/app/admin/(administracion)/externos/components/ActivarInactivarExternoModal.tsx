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
import { Externo } from "../types";
import { toast } from "sonner";

interface Props {
  externo: Externo | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ActivarInactivarExternoModal({
  externo,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { sessionRequest } = useAuth();

  if (!externo) return null;

  const isActivating = externo.estado !== "ACTIVO";
  const actionLabel = isActivating ? "activar" : "inactivar";

  const handleConfirm = async () => {
    try {
      const url = `/externos/${externo.id}/${isActivating ? "activar" : "inactivar"}`;
      await sessionRequest({
        url,
        method: "patch",
      });

      toast.success(
        `Externo ${isActivating ? "activado" : "inactivado"} correctamente`,
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
            ¿Está seguro de {actionLabel} al externo?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción cambiará el estado del externo{" "}
            <strong>
              {externo.usuario.persona.nombres}{" "}
              {externo.usuario.persona.primerApellido}
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
