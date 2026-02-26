import { useAuth } from "@/contexts/AuthProvider";
import { Usuario } from "../types";
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

interface ActivarInactivarModalProps {
  usuario: Usuario | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ActivarInactivarModal({
  usuario,
  isOpen,
  onClose,
  onSuccess,
}: ActivarInactivarModalProps) {
  console.log({ usuario });

  const { sessionRequest } = useAuth();

  const handleActivarInactivar = async () => {
    if (!usuario) return;

    try {
      const result = await sessionRequest({
        url: `/usuarios/${usuario.id}/${
          usuario?.estado === "ACTIVO" ? "inactivar" : "activar"
        }`,
        method: "PATCH",
      });
      toast.success("Usuario actualizado", {
        description: MessageInterpreter(result?.data),
      });
      onSuccess();
    } catch (error) {
      print("Error al activar/inactivar usuario", error);
      toast.error("Error al activar/inactivar usuario", {
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
            {usuario?.estado === "ACTIVO" ? "Desactivar" : "Activar"} usuario
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estas seguro de{" "}
            {usuario?.estado === "ACTIVO" ? "desactivar" : "activar"} el usuario{" "}
            {usuario?.persona.nombres} {usuario?.persona.primerApellido}{" "}
            {usuario?.persona.segundoApellido}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleActivarInactivar}>
            {usuario?.estado === "ACTIVO" ? "Desactivar" : "Activar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
