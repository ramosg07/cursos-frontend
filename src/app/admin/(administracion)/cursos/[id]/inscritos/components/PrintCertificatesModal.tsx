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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { PlantillaCertificado } from "../../../../certificados/types";

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
  const [idPlantilla, setIdPlantilla] = useState<string>("");
  const [isPrinting, setIsPrinting] = useState(false);

  // Obtener plantillas activas
  const { data: plantillas, isLoading } = useQuery({
    queryKey: ["plantillas-certificados-activas"],
    queryFn: async () => {
      const response = await sessionRequest<any>({
        url: "/plantillas-certificados",
      });
      return response?.data?.datos?.filas?.filter(
        (p: PlantillaCertificado) => p.estado === "ACTIVO",
      ) as PlantillaCertificado[];
    },
    enabled: isOpen,
  });

  const handlePrint = async () => {
    if (!idPlantilla) {
      toast.error("Seleccione una plantilla");
      return;
    }

    setIsPrinting(true);
    try {
      const response = await sessionRequest<any>({
        url: "/certificados/generar-masivo",
        method: "POST",
        data: {
          idCurso,
          idPlantilla,
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
      console.error(error);
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
          <div className="space-y-2">
            <Label>Plantilla de Certificado</Label>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando plantillas...
              </div>
            ) : (
              <Select value={idPlantilla} onValueChange={setIdPlantilla}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {plantillas?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
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
          <Button onClick={handlePrint} disabled={!idPlantilla || isPrinting}>
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
