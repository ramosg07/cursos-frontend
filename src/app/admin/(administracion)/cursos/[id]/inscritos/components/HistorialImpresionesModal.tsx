"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthProvider";
import { Loader2, History, Users, Printer, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { print } from "@/lib/print";
import dayjs from "dayjs";

interface ImpresionRegistro {
  id: string;
  tipo: "individual" | "masivo";
  idLoteMasivo: string | null;
  fechaImpresion: string;
  usuario: {
    id: string;
    usuario: string;
    nombre: string | null;
  } | null;
}

interface HistorialData {
  idInscripcion: string;
  totalImpresiones: number;
  impresiones: ImpresionRegistro[];
}

interface Props {
  idInscripcion: string;
  nombreEstudiante?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function HistorialImpresionesModal({
  idInscripcion,
  nombreEstudiante,
  isOpen,
  onClose,
}: Props) {
  const { sessionRequest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HistorialData | null>(null);

  useEffect(() => {
    if (!isOpen || !idInscripcion) return;

    const fetchHistorial = async () => {
      setLoading(true);
      try {
        const response = await sessionRequest<HistorialData>({
          url: `/certificados/impresiones/${idInscripcion}`,
          method: "GET",
        });
        if (response?.data) {
          setData(response.data);
        }
      } catch (error) {
        print("Error al cargar historial de impresiones", error);
        toast.error("Error al cargar el historial de impresiones");
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [isOpen, idInscripcion, sessionRequest]);

  // Agrupar lotes masivos para mostrar agrupador
  const lotesMasivos = data
    ? [...new Set(data.impresiones.filter((i) => i.idLoteMasivo).map((i) => i.idLoteMasivo!))]
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Historial de Impresiones
          </DialogTitle>
          {nombreEstudiante && (
            <p className="text-sm text-muted-foreground pt-1">
              {nombreEstudiante}
            </p>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Cargando historial...
            </span>
          </div>
        ) : !data || data.totalImpresiones === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <PackageSearch className="h-10 w-10 opacity-30" />
            <p className="text-sm text-center">
              Este certificado aún no ha sido impreso.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            {/* Resumen */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-card p-3 flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Printer className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Total impresiones
                  </p>
                  <p className="text-xl font-bold">{data.totalImpresiones}</p>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-3 flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    Lotes masivos
                  </p>
                  <p className="text-xl font-bold">{lotesMasivos.length}</p>
                </div>
              </div>
            </div>

            {/* Línea de tiempo */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold px-1">
                Registro de impresiones
              </p>
              <div className="relative flex flex-col gap-0">
                {data.impresiones.map((imp, idx) => (
                  <div key={imp.id} className="flex gap-3 items-start">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`mt-3 h-3 w-3 rounded-full border-2 flex-shrink-0 ${
                          imp.tipo === "masivo"
                            ? "bg-blue-500 border-blue-500"
                            : "bg-primary border-primary"
                        }`}
                      />
                      {idx < data.impresiones.length - 1 && (
                        <div className="w-0.5 bg-border flex-1 min-h-[1.5rem]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-3">
                      <div className="rounded-lg border bg-card p-3 flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                imp.tipo === "masivo" ? "secondary" : "default"
                              }
                              className="text-xs h-5 px-1.5"
                            >
                              {imp.tipo === "masivo" ? (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Masivo
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Printer className="h-3 w-3" />
                                  Individual
                                </span>
                              )}
                            </Badge>
                            {imp.idLoteMasivo && (
                              <span
                                className="text-xs text-muted-foreground font-mono truncate max-w-[120px]"
                                title={`Lote: ${imp.idLoteMasivo}`}
                              >
                                Lote: {imp.idLoteMasivo.slice(0, 8)}…
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium">
                            {imp.usuario?.nombre ||
                              imp.usuario?.usuario ||
                              "Usuario desconocido"}
                          </p>
                          {imp.usuario?.usuario && imp.usuario?.nombre && (
                            <p className="text-xs text-muted-foreground">
                              @{imp.usuario.usuario}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-medium">
                            {dayjs(imp.fechaImpresion).format("DD/MM/YYYY")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dayjs(imp.fechaImpresion).format("HH:mm:ss")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
