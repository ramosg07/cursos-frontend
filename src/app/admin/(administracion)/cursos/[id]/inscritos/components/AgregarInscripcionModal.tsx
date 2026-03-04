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
      await sessionRequest({
        url: "/inscripciones",
        method: "post",
        data: {
          idEstudiante: estudiante.id,
          idParalelo: idParaleloSeleccionado,
        },
      });
      toast.success("Estudiante inscrito correctamente");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.log({ error });
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Inscribir Estudiante</DialogTitle>
        </DialogHeader>

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
                  <Badge variant="outline">{estudiante.usuario.usuario}</Badge>
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
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          Paralelo {p.nombre} (Cupo: {p.cupo})
                        </SelectItem>
                      ))}
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

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
