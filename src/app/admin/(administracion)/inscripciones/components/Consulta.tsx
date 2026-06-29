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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  Calendar,
  Coins,
  Loader2,
  Search,
  UserPlus,
  History,
  FileText,
  Printer,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { print } from "@/lib/print";
import { useAuth } from "@/contexts/AuthProvider";

interface Props {
  inscribir: (data: any) => void;
}

interface EstatusRecibo {
  codigoRecibo: string;
  impreso: boolean;
  totalImpresiones: number;
  ultimaImpresion: { fecha: string; usuario: string } | null;
  historial: { fecha: string; usuario: string }[];
}

interface GrupoRecibo {
  codigoRecibo: string;
  inscripciones: any[];
  fecha: string;
}

export function Consulta({ inscribir }: Props) {
  const { sessionRequest, user } = useAuth();
  const rolActivo = user?.roles.find((rol) => user.idRol === rol.idRol);
  const esCoordinadorGeneral = rolActivo?.rol === "COORDINADOR GENERAL";

  // Estado para Consulta por CI
  const [ciConsulta, setCiConsulta] = useState("");
  const [inscripcionesConsulta, setInscripcionesConsulta] = useState<any[]>([]);
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [estudianteConsulta, setEstudianteConsulta] = useState<any | null>(
    null
  );
  const [printingReport, setPrintingReport] = useState(false);

  // Estado para reimpresión por codigoRecibo
  const [imprimiendoRecibo, setImprimiendoRecibo] = useState<string | null>(
    null
  );
  const [dialogConfig, setDialogConfig] = useState<{
    open: boolean;
    codigoRecibo: string;
    estatus: EstatusRecibo | null;
  }>({ open: false, codigoRecibo: "", estatus: null });

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
          if (filas[0].estudiante) {
            setEstudianteConsulta(filas[0].estudiante);
          }
          if (filas[0].docente) {
            setEstudianteConsulta(filas[0].docente);
          }
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
        error?.response?.data?.mensaje || "Error al consultar inscripciones"
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

  // Agrupa inscripciones por codigoRecibo
  const gruposRecibo: GrupoRecibo[] = useCallback(() => {
    const map = new Map<string, any[]>();
    for (const ins of inscripcionesConsulta) {
      const key = ins.codigoRecibo || `sin-codigo-${ins.id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ins);
    }
    return Array.from(map.entries()).map(([codigoRecibo, insList]) => ({
      codigoRecibo,
      inscripciones: insList,
      fecha: insList[0]?.fechaInscripcion,
    }));
  }, [inscripcionesConsulta])();

  // Inicia la reimpresión: primero verifica estatus
  const handleIniciarReimpresion = async (grupo: GrupoRecibo) => {
    const { codigoRecibo, inscripciones } = grupo;

    if (!codigoRecibo.startsWith("REC-")) {
      // Inscripción histórica sin código de recibo → usar endpoint individual o múltiple
      await ejecutarDescargaHistorica(inscripciones);
      return;
    }
    try {
      const res = await sessionRequest<{ datos: EstatusRecibo }>({
        url: `/inscripciones/recibo/${codigoRecibo}/estatus`,
        method: "get",
      });
      const estatus = res?.data?.datos;
      if (estatus?.impreso) {
        // Ya fue impreso → mostrar diálogo de confirmación
        setDialogConfig({ open: true, codigoRecibo, estatus });
      } else {
        // Primera vez → imprimir sin confirmación
        await ejecutarDescargaRecibo(codigoRecibo);
      }
    } catch (err) {
      toast.error("Error al verificar el estado del recibo");
      print("Error estatus recibo", err);
    }
  };

  // Descarga recibos para inscripciones sin codigoRecibo (históricas)
  const ejecutarDescargaHistorica = async (inscripciones: any[]) => {
    const firstId = inscripciones[0]?.id;
    if (!firstId) return;
    setImprimiendoRecibo(`historico-${firstId}`);
    try {
      // Si es una sola, usar el endpoint individual
      let url: string;
      let method: string;
      let body: any = undefined;
      if (inscripciones.length === 1) {
        url = `/inscripciones/${firstId}/recibo`;
        method = "get";
      } else {
        url = `/inscripciones/multiple/recibo`;
        method = "post";
        body = { idsInscripcion: inscripciones.map((i) => i.id) };
      }
      const response = await sessionRequest<Blob>({
        url,
        method,
        data: body,
        responseType: "blob",
      });
      if (response && response.data) {
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute(
          "download",
          `recibo-${new Date().getTime()}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Recibo descargado");
      }
    } catch (error) {
      toast.error("Error al descargar el recibo");
      print("Error descarga recibo histórico", error);
    } finally {
      setImprimiendoRecibo(null);
    }
  };

  const ejecutarDescargaRecibo = async (codigoRecibo: string) => {
    setImprimiendoRecibo(codigoRecibo);
    try {
      const response = await sessionRequest<Blob>({
        url: `/inscripciones/recibo/${codigoRecibo}`,
        method: "get",
        responseType: "blob",
      });

      if (response && response.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${codigoRecibo}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success(`Recibo ${codigoRecibo} descargado`);
      }
    } catch (error) {
      toast.error("Error al descargar el recibo");
      print("Error descarga recibo", error);
    } finally {
      setImprimiendoRecibo(null);
    }
  };

  const handleConfirmarReimpresion = async () => {
    setDialogConfig((prev) => ({ ...prev, open: false }));
    await ejecutarDescargaRecibo(dialogConfig.codigoRecibo);
  };

  const totalInscripciones = inscripcionesConsulta.reduce(
    (acc, curr) => acc + Number(curr.montoPagado),
    0
  );

  return (
    <>
      {/* Diálogo de confirmación de reimpresión */}
      <AlertDialog
        open={dialogConfig.open}
        onOpenChange={(open) =>
          setDialogConfig((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <AlertDialogTitle className="text-lg font-black">
                Recibo ya impreso
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Este recibo ya fue impreso anteriormente. ¿Desea generar una
                  copia adicional?
                </p>
                {dialogConfig.estatus?.ultimaImpresion && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-black uppercase tracking-wider text-amber-700">
                      Última impresión
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="font-bold text-amber-800">
                        {new Date(
                          dialogConfig.estatus.ultimaImpresion.fecha
                        ).toLocaleString("es-BO")}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-amber-800">
                      Por:{" "}
                      <span className="font-black">
                        {dialogConfig.estatus.ultimaImpresion.usuario}
                      </span>
                    </p>
                    <p className="text-xs text-amber-600 font-medium">
                      Total de impresiones:{" "}
                      <strong>{dialogConfig.estatus.totalImpresiones}</strong>
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarReimpresion}
              className="bg-primary font-black"
            >
              <Printer className="mr-2 h-4 w-4" />
              Reimprimir de todas formas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="overflow-hidden border-2 border-primary/10 shadow-xl shadow-primary/5 bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="bg-primary/5 border-b border-primary/10 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-black">
                Consultar Historial
              </CardTitle>
              <CardDescription className="text-base">
                Verifique los cursos en los que ya se encuentra inscrito.
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
                        <Badge
                          variant="outline"
                          className="font-bold border-primary/30"
                        >
                          Recibos: {gruposRecibo.length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {esCoordinadorGeneral && inscripcionesConsulta.length > 0 && (
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

              {/* Recibos agrupados */}
              {gruposRecibo.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 px-2">
                    <History className="h-5 w-5 text-primary" />
                    <h4 className="text-lg font-black">
                      Recibos de Inscripción
                    </h4>
                    <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
                      {gruposRecibo.length}{" "}
                      {gruposRecibo.length === 1 ? "recibo" : "recibos"}
                    </Badge>
                  </div>

                  {gruposRecibo.map((grupo, idx) => (
                    <Card
                      key={grupo.codigoRecibo}
                      className="border-2 border-primary/5 shadow-xl overflow-hidden"
                    >
                      {/* Cabecera del recibo */}
                      <div className="bg-primary/5 border-b border-primary/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm shadow-md">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-black text-sm text-primary uppercase tracking-widest">
                              {grupo.codigoRecibo.startsWith("REC-")
                                ? grupo.codigoRecibo
                                : "Inscripción histórica"}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Calendar className="h-3 w-3" />
                              <span className="font-bold">
                                {new Date(grupo.fecha).toLocaleDateString(
                                  "es-BO",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                              <span>
                                {new Date(grupo.fecha).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {esCoordinadorGeneral && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={
                                imprimiendoRecibo === grupo.codigoRecibo ||
                                imprimiendoRecibo ===
                                  `historico-${grupo.inscripciones[0]?.id}`
                              }
                              onClick={() =>
                                handleIniciarReimpresion(grupo)
                              }
                              className="h-9 px-4 font-black border-primary/30 text-primary hover:bg-primary hover:text-white transition-all"
                            >
                              {imprimiendoRecibo === grupo.codigoRecibo ||
                              imprimiendoRecibo ===
                                `historico-${grupo.inscripciones[0]?.id}` ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Printer className="mr-2 h-4 w-4" />
                              )}
                              {grupo.codigoRecibo.startsWith("REC-")
                                ? "Reimprimir Recibo"
                                : "Imprimir Recibo"}
                            </Button>
                          )}
                      </div>

                      {/* Tabla de inscripciones del recibo */}
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead className="font-black text-xs uppercase tracking-widest pl-6">
                              Curso / Paralelo
                            </TableHead>
                            <TableHead className="font-black text-xs uppercase tracking-widest text-right pr-6">
                              Monto
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grupo.inscripciones.map((ins) => (
                            <TableRow
                              key={ins.id}
                              className="hover:bg-primary/5 transition-colors group"
                            >
                              <TableCell className="py-4 pl-6">
                                <div>
                                  <p className="font-black text-sm group-hover:text-primary transition-colors line-clamp-1">
                                    {ins.paralelo?.curso?.nombre}
                                  </p>
                                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                                    {ins.paralelo?.nombre}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right py-4 pr-6">
                                <div className="flex flex-col items-end">
                                  <span className="font-mono font-black text-base text-primary">
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

                      {/* Total del recibo */}
                      <div className="bg-primary/5 px-6 py-4 flex justify-between items-center border-t border-primary/10">
                        <div className="flex items-center gap-2">
                          <Coins className="h-5 w-5 text-primary" />
                          <span className="font-black text-muted-foreground uppercase tracking-wider text-xs">
                            Total Recibo
                          </span>
                        </div>
                        <span className="text-2xl font-black text-primary">
                          Bs.{" "}
                          {grupo.inscripciones
                            .reduce(
                              (acc, curr) => acc + Number(curr.montoPagado),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    </Card>
                  ))}

                  {/* Gran total */}
                  {gruposRecibo.length > 1 && (
                    <div className="flex justify-between items-center px-4 py-4 rounded-2xl border-2 border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-2">
                        <Coins className="h-6 w-6 text-primary" />
                        <span className="font-black text-muted-foreground uppercase tracking-wider text-sm">
                          Inversión Total Acumulada
                        </span>
                      </div>
                      <span className="text-3xl font-black text-primary">
                        Bs. {totalInscripciones.toFixed(2)}
                      </span>
                    </div>
                  )}
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
                      Ir a Inscribir
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
