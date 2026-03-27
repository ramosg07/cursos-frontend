"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { print } from "@/lib/print";

interface Props {
  idCurso: string;
  selectedInscripciones?: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function PrintCertificatesModal({
  idCurso,
  selectedInscripciones,
  isOpen,
  onClose,
}: Props) {
  const { sessionRequest } = useAuth();
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const response = await sessionRequest<any>({
        url: "/certificados/generar-masivo",
        method: "POST",
        data: {
          idCurso,
          idInscripciones: selectedInscripciones || [],
        },
        responseType: "blob",
      });

      if (response) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `certificados-${idCurso}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Certificados generados correctamente");
        onClose();
      }
    } catch (error) {
      print("Error al generar certificados", error);
      toast.error("Error al generar certificados");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Imprimir Certificados
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-sm text-muted-foreground">
            {selectedInscripciones && selectedInscripciones.length > 0
              ? `Se imprimirán ${selectedInscripciones.length} certificados seleccionados.`
              : "Se imprimirán los certificados de TODOS los inscritos en este curso."}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPrinting}>
            Cancelar
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting}>
            {isPrinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              "Generar PDF"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
