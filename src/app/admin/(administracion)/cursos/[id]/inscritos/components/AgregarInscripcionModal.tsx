"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { EstudianteBusqueda } from "../types";
import { toast } from "sonner";
import { Search, UserPlus, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Paralelo } from "../../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { print } from "@/lib/print";

interface Props {
  paralelos: Paralelo[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AgregarInscripcionModal({
  paralelos,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { sessionRequest } = useAuth();
  const [nroDocumento, setNroDocumento] = useState("");
  const [estudiante, setEstudiante] = useState<EstudianteBusqueda | null>(null);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [idParaleloSeleccionado, setIdParaleloSeleccionado] =
    useState<string>("");
  const [idInscripcionExitosa, setIdInscripcionExitosa] = useState<
    string | null
  >(null);
  const [descargandoRecibo, setDescargandoRecibo] = useState(false);

  const handleSearch = async () => {
    if (!nroDocumento.trim()) return;
    setLoading(true);
    setEstudiante(null);
    try {
      const response = await sessionRequest<{
        finalizado: boolean;
        datos: EstudianteBusqueda;
      }>({
        url: `/inscripciones/buscar-estudiante/${nroDocumento}`,
        method: "get",
      });
      if (response && response.data.datos) {
        setEstudiante(response.data.datos);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.mensaje || "Estudiante no encontrado");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrol = async () => {
    if (!estudiante) return;
    setEnrolling(true);
    try {
      const resultado = await sessionRequest<any>({
        url: "/inscripciones",
        method: "post",
        data: {
          idEstudiante: estudiante.id,
          idParalelo: idParaleloSeleccionado,
        },
      });

      if (resultado && resultado.data?.datos?.id) {
        setIdInscripcionExitosa(resultado.data.datos.id);
        toast.success("Estudiante inscrito correctamente");
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error?.message;
      toast.error(
        Array.isArray(errorMessage)
          ? errorMessage[0]
          : errorMessage || "Error al inscribir",
      );
    } finally {
      setEnrolling(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!idInscripcionExitosa) return;
    setDescargandoRecibo(true);
    try {
      const response: any = await sessionRequest({
        url: `/inscripciones/${idInscripcionExitosa}/recibo`,
        method: "get",
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `recibo-${idInscripcionExitosa}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      print("Error downloading receipt", error);
      toast.error("Error al descargar el recibo");
    } finally {
      setDescargandoRecibo(false);
    }
  };

  const resetAndClose = () => {
    setNroDocumento("");
    setEstudiante(null);
    setIdParaleloSeleccionado("");
    setIdInscripcionExitosa(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {idInscripcionExitosa
              ? "Inscripción Exitosa"
              : "Inscribir Estudiante"}
          </DialogTitle>
        </DialogHeader>

        {idInscripcionExitosa ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold">¡Estudiante Inscrito!</h3>
              <p className="text-muted-foreground mt-2">
                La inscripción se ha realizado correctamente. <br />
                Puedes descargar el recibo ahora.
              </p>
            </div>
            <Button
              className="mt-4"
              onClick={handleDownloadReceipt}
              disabled={descargandoRecibo}
            >
              {descargandoRecibo ? "Generando..." : "Descargar Recibo PDF"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex items-end gap-2">
              <Field className="flex-1">
                <FieldLabel>Documento de Identidad (Buscador)</FieldLabel>
                <Input
                  placeholder="Ingrese CI del estudiante"
                  value={nroDocumento}
                  onChange={(e) => setNroDocumento(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </Field>
              <Button
                onClick={handleSearch}
                disabled={loading}
                variant="secondary"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>

            {estudiante && (
              <div className="border rounded-lg p-4 bg-muted/30 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">
                      {estudiante.usuario.persona.nombres}{" "}
                      {estudiante.usuario.persona.primerApellido}{" "}
                      {estudiante.usuario.persona.segundoApellido ?? ""}
                    </p>
                    <Badge variant="outline">
                      {estudiante.usuario.usuario}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {estudiante.usuario.correoElectronico}
                  </p>
                  {estudiante.codigoPersonal && (
                    <p className="text-xs text-muted-foreground font-mono">
                      Cód: {estudiante.codigoPersonal}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => setEstudiante(null)}
                  size="icon"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {estudiante && (
              <div className="space-y-4 pt-2">
                <Separator />
                <Field>
                  <FieldLabel>Seleccionar Paralelo</FieldLabel>
                  <Select
                    value={idParaleloSeleccionado}
                    onValueChange={setIdParaleloSeleccionado}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un paralelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {paralelos
                        .filter((p) => p.estado === "ACTIVO")
                        .map((p) => {
                          const disponibles = p.cuposDisponibles ?? p.cupo;
                          return (
                            <SelectItem
                              key={p.id}
                              value={p.id}
                              disabled={disponibles === 0}
                            >
                              Paralelo {p.nombre} —{" "}
                              {disponibles === 0
                                ? "Sin cupos"
                                : `${disponibles} cupo${disponibles !== 1 ? "s" : ""} disponible${disponibles !== 1 ? "s" : ""}`}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                  {paralelos.length === 0 && (
                    <p className="text-xs text-destructive mt-1">
                      Este curso no tiene paralelos activos configurados.
                    </p>
                  )}
                </Field>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {idInscripcionExitosa ? (
            <Button
              variant="outline"
              onClick={resetAndClose}
              className="w-full"
            >
              Cerrar y Continuar
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose} disabled={enrolling}>
                Cancelar
              </Button>
              <Button
                onClick={handleEnrol}
                disabled={!estudiante || !idParaleloSeleccionado || enrolling}
              >
                {enrolling ? (
                  "Inscribiendo..."
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Inscribir Estudiante
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
