import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Calendar,
  Coins,
  Loader2,
  Search,
  UserPlus,
  History,
  Printer,
  FileText,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { print } from "@/lib/print";
import { useAuth } from "@/contexts/AuthProvider";

interface Props {
  inscribir: (data: any) => void;
}
export function Consulta({ inscribir }: Props) {
  const { sessionRequest } = useAuth();

  // Estado para Consulta por CI
  const [ciConsulta, setCiConsulta] = useState("");
  const [inscripcionesConsulta, setInscripcionesConsulta] = useState<any[]>([]);
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [estudianteConsulta, setEstudianteConsulta] = useState<any | null>(
    null,
  );
  const [printingReport, setPrintingReport] = useState(false);

  const handleConsultaInscripciones = async () => {
    if (!ciConsulta.trim()) return;
    setLoadingConsulta(true);
    setBusquedaRealizada(true);
    setInscripcionesConsulta([]);
    setEstudianteConsulta(null);
    try {
      const response = await sessionRequest<{
        datos: any[];
      }>({
        url: `/inscripciones/estudiante/${ciConsulta}`,
        method: "get",
      });

      if (response && response.data.datos) {
        const filas = response.data.datos;
        setInscripcionesConsulta(filas);
        if (filas.length > 0) {
          setEstudianteConsulta(filas[0].estudiante);
        } else {
          // Si no hay inscripciones, intentar buscar al estudiante para mostrar su info al menos
          try {
            const resEst = await sessionRequest<{ datos: any }>({
              url: `/inscripciones/buscar-estudiante/${ciConsulta}`,
              method: "get",
            });
            if (resEst && resEst.data.datos) {
              setEstudianteConsulta(resEst.data.datos);
            }
          } catch (e) {
            print("Estudiante no encontrado en consulta", e);
          }
        }
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.mensaje || "Error al consultar inscripciones",
      );
    } finally {
      setLoadingConsulta(false);
    }
  };

  const handleDescargarHistorial = async () => {
    if (!ciConsulta) return;
    setPrintingReport(true);
    try {
      const response = await sessionRequest<Blob>({
        url: `/inscripciones/estudiante/${ciConsulta}/reporte-historial`,
        method: "get",
        responseType: "blob",
      });

      if (response && response.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `historial-${ciConsulta}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Historial de inscripciones descargado");
      }
    } catch (error) {
      toast.error("Error al descargar el historial");
      print("Error al descargar el historial", error);
    } finally {
      setPrintingReport(false);
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/10 shadow-xl shadow-primary/5 bg-gradient-to-br from-card to-muted/30">
      <CardHeader className="bg-primary/5 border-b border-primary/10 px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-black">
              Consultar Historial por Estudiante
            </CardTitle>
            <CardDescription className="text-base">
              Verifique los cursos en los que ya se encuentra inscrito el
              estudiante.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-8 pt-8 pb-8">
        <div className="flex flex-col md:flex-row items-end gap-4 max-w-2xl">
          <div className="flex-1 w-full space-y-3">
            <label className="text-sm font-black text-muted-foreground ml-1">
              Documento de Identidad (CI)
            </label>
            <div className="relative mt-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Ingrese CI para consultar..."
                value={ciConsulta}
                onChange={(e) => setCiConsulta(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleConsultaInscripciones()
                }
                className="h-14 pl-12 text-lg font-bold bg-muted/50 border-2 focus-visible:ring-primary/20"
              />
            </div>
          </div>
          <Button
            onClick={handleConsultaInscripciones}
            disabled={loadingConsulta || !ciConsulta}
            className="h-14 px-10 text-lg font-black shadow-lg shadow-accent/20 active:scale-95 transition-all"
            size="lg"
          >
            {loadingConsulta ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              "Consultar"
            )}
          </Button>
        </div>

        {busquedaRealizada && !loadingConsulta && (
          <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {estudianteConsulta ? (
              <div className="p-6 rounded-3xl border-2 border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-primary/20">
                    {estudianteConsulta.usuario?.persona?.nombres?.[0] || "E"}
                  </div>
                  <div>
                    <p className="font-black text-2xl">
                      {estudianteConsulta.usuario?.persona?.nombres}{" "}
                      {estudianteConsulta.usuario?.persona?.primerApellido}{" "}
                      {estudianteConsulta.usuario?.persona?.segundoApellido}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <Badge
                        variant="outline"
                        className="font-bold border-primary/30"
                      >
                        CI: {estudianteConsulta.usuario?.persona?.nroDocumento}
                      </Badge>
                      <Badge variant="default" className="bg-primary font-bold">
                        Inscripciones: {inscripcionesConsulta.length}
                      </Badge>
                    </div>
                  </div>
                </div>
                {inscripcionesConsulta.length > 0 && (
                  <Button
                    onClick={handleDescargarHistorial}
                    disabled={printingReport}
                    variant="default"
                    className="h-12 px-6 font-black bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20"
                  >
                    {printingReport ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-5 w-5" />
                    )}
                    Descargar Historial (PDF)
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-2">
                  <UserPlus className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-2xl font-black text-muted-foreground/50">
                  Estudiante no encontrado
                </h3>
                <p className="text-muted-foreground max-w-xs">
                  No se encontró ningún estudiante con el CI proporcionado.
                </p>
              </div>
            )}

            {inscripcionesConsulta.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                  <h4 className="text-lg font-black flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" /> Cursos
                    Inscritos
                  </h4>
                </div>
                <Card className="border-2 border-primary/5 shadow-2xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-black text-xs uppercase tracking-widest pl-8">
                          Curso / Paralelo
                        </TableHead>
                        <TableHead className="font-black text-xs uppercase tracking-widest text-center">
                          Fecha
                        </TableHead>
                        <TableHead className="font-black text-xs uppercase tracking-widest text-right pr-8">
                          Monto
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inscripcionesConsulta.map((ins) => (
                        <TableRow
                          key={ins.id}
                          className="hover:bg-primary/5 transition-colors group"
                        >
                          <TableCell className="py-5 pl-8">
                            <div>
                              <p className="font-black text-base group-hover:text-primary transition-colors line-clamp-1">
                                {ins.paralelo?.curso?.nombre}
                              </p>
                              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
                                {ins.paralelo?.nombre}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-5">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-sm">
                                {new Date(
                                  ins.fechaInscripcion,
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {new Date(
                                  ins.fechaInscripcion,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-5 pr-8">
                            <div className="flex flex-col items-end">
                              <span className="font-mono font-black text-lg text-primary">
                                Bs. {ins.montoPagado}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[9px] h-4 py-0 font-bold border-green-500/30 text-green-600 bg-green-500/5"
                              >
                                PAGADO
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="bg-primary/5 px-8 py-6 flex justify-between items-center border-t border-primary/10">
                    <div className="flex items-center gap-2">
                      <Coins className="h-6 w-6 text-primary" />
                      <span className="font-black text-muted-foreground uppercase tracking-wider text-sm">
                        Inversión Total
                      </span>
                    </div>
                    <span className="text-3xl font-black text-primary">
                      Bs.{" "}
                      {inscripcionesConsulta
                        .reduce(
                          (acc, curr) => acc + Number(curr.montoPagado),
                          0,
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                </Card>
              </div>
            )}

            {inscripcionesConsulta.length === 0 && estudianteConsulta && (
              <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/5">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center opacity-50">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-muted-foreground">
                    Sin inscripciones actuales
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    El estudiante está registrado en el sistema pero aún no
                    tiene ninguna inscripción activa.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 font-black text-xs uppercase tracking-widest"
                    onClick={() => {
                      inscribir({
                        nroDocumento:
                          estudianteConsulta.usuario?.persona?.nroDocumento,
                      });
                    }}
                  >
                    Ir a Inscribir Estudiante
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
