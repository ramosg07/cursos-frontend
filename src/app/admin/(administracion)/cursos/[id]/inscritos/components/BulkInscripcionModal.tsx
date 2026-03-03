"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, FileUp, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
  idCurso: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkInscripcionModal({
  idCurso,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    exitosos: number;
    fallidos: number;
    errores: string[];
  } | null>(null);

  const { sessionRequest } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("idCurso", idCurso);

      const response = await sessionRequest<{
        finalizado: boolean;
        datos: { exitosos: number; fallidos: number; errores: string[] };
      }>({
        url: "/inscripciones/carga-masiva",
        method: "post",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response && response.data) {
        setResult(response.data.datos);
        if (response.data.datos.exitosos > 0) {
          onSuccess();
        }
        toast.success("Proceso de carga masiva de inscripciones finalizado");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.mensaje || "Error al subir el archivo",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Inscripciones</DialogTitle>
          <DialogDescription>
            Sube un archivo Excel (.xlsx) o CSV con la columna: nroDocumento.
            Los estudiantes ya deben estar registrados en el sistema.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg gap-4 border-muted-foreground/25">
            <FileUp className="h-12 w-12 text-muted-foreground" />
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="max-w-[300px]"
            />
            {file && (
              <p className="text-sm text-blue-600 font-medium">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Alert
                variant="default"
                className="border-green-500 bg-green-50 text-green-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Éxitos</AlertTitle>
                <AlertDescription className="text-2xl font-bold">
                  {result.exitosos}
                </AlertDescription>
              </Alert>
              <Alert variant="destructive" className="bg-red-50 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Fallos</AlertTitle>
                <AlertDescription className="text-2xl font-bold">
                  {result.fallidos}
                </AlertDescription>
              </Alert>
            </div>

            {result.errores.length > 0 && (
              <div className="max-h-[200px] overflow-y-auto border rounded p-4 bg-muted/50">
                <p className="text-sm font-semibold mb-2">
                  Detalle de errores:
                </p>
                <ul className="text-xs space-y-1 list-disc pl-4">
                  {result.errores.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            {result ? "Cerrar" : "Cancelar"}
          </Button>
          {!result && (
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Subir y Procesar"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
