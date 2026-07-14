import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthProvider";
import {
  BookOpen,
  Calendar,
  Coins,
  Loader2,
  Search,
  UserPlus,
  History,
  Printer,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { print } from "@/lib/print";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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

interface Props {
  comprar: (data: any) => void;
}

interface EstatusRecibo {
  codigoRecibo: string;
  impreso: boolean;
  totalImpresiones: number;
  ultimaImpresion: { fecha: string; usuario: string } | null;
  historial: { fecha: string; usuario: string }[];
}

export function Consulta({ comprar }: Props) {
  // Estado para Consulta por CI
  const [ciConsulta, setCiConsulta] = useState("");
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const { sessionRequest, user } = useAuth();
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [comprasConsulta, setComprasConsulta] = useState<any[]>([]);
  const [postulanteConsulta, setPostulanteConsulta] = useState<any | null>(
    null,
  );

  const [imprimiendoRecibo, setImprimiendoRecibo] = useState<string | null>(
    null,
  );
  const [dialogConfig, setDialogConfig] = useState<{
    open: boolean;
    numeroRecibo: string;
    estatus: EstatusRecibo | null;
  }>({ open: false, numeroRecibo: "", estatus: null });

  const rolActivo = user?.roles.find((rol) => user.idRol === rol.idRol);
  const esCoordinadorGeneral = rolActivo?.rol === "COORDINADOR GENERAL";

  const handleConsultaCompras = async () => {
    if (!ciConsulta.trim()) return;
    setLoadingConsulta(true);
    setBusquedaRealizada(true);
    setComprasConsulta([]);
    setPostulanteConsulta(null);
    try {
      const response = await sessionRequest<{
        datos: any[];
      }>({
        url: `/ventas/${ciConsulta}`,
        method: "get",
      });

      if (response && response.data.datos) {
        const filas = response.data.datos;
        console.log({ filas });
        setComprasConsulta(filas);
        if (filas.length > 0) {
          if (filas[0].postulante) {
            setPostulanteConsulta(filas[0].postulante);
          }
        } else {
          // Si no hay inscripciones, intentar buscar al estudiante para mostrar su info al menos
          try {
            const resEst = await sessionRequest<{ datos: any }>({
              url: `/ventas/buscar-postulante/${ciConsulta}`,
              method: "get",
            });
            if (resEst && resEst.data.datos) {
              setPostulanteConsulta(resEst.data.datos);
            }
          } catch (e) {
            print("Postulante no encontrado en consulta", e);
          }
        }
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.mensaje || "Error al consultar compras",
      );
    } finally {
      setLoadingConsulta(false);
    }
  };

  const handleIniciarReimpresion = async (venta: any) => {
    const { numeroRecibo } = venta;

    try {
      const res = await sessionRequest<{ datos: EstatusRecibo }>({
        url: `/ventas/recibo/${numeroRecibo}/estatus`,
        method: "get",
      });
      const estatus = res?.data?.datos;
      if (estatus?.impreso) {
        // Ya fue impreso → mostrar diálogo de confirmación
        setDialogConfig({ open: true, numeroRecibo, estatus });
      } else {
        // Primera vez → imprimir sin confirmación
        await ejecutarDescargaRecibo(numeroRecibo);
      }
    } catch (err) {
      toast.error("Error al verificar el estado del recibo");
      print("Error estatus recibo", err);
    }
  };

  const ejecutarDescargaRecibo = async (numeroRecibo: string) => {
    setImprimiendoRecibo(numeroRecibo);
    try {
      const response = await sessionRequest<Blob>({
        url: `/ventas/recibo/${numeroRecibo}`,
        method: "get",
        responseType: "blob",
      });

      if (response && response.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${numeroRecibo}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success(`Recibo ${numeroRecibo} descargado`);
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
    await ejecutarDescargaRecibo(dialogConfig.numeroRecibo);
  };

  const totalInscripciones = comprasConsulta
    .flatMap((compra) => compra.detalles)
    .reduce((total, detalle) => total + Number(detalle.subtotal), 0);

  console.log({ comprasConsulta });
  console.log({ totalInscripciones });
  return (
    <>
      {/* Diálogo de confirmación de reimpresión */}
      <AlertDialog
        open={dialogConfig.open}
        onOpenChange={(open) => setDialogConfig((prev) => ({ ...prev, open }))}
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
                          dialogConfig.estatus.ultimaImpresion.fecha,
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
            <AlertDialogCancel className="font-bold">
              Cancelar
            </AlertDialogCancel>
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
                Verifique los productos comprados.
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
                    e.key === "Enter" && handleConsultaCompras()
                  }
                  className="h-14 pl-12 text-lg font-bold bg-muted/50 border-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
            <Button
              onClick={handleConsultaCompras}
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
              {postulanteConsulta ? (
                <div className="p-6 rounded-3xl border-2 border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-primary/20">
                      {postulanteConsulta?.nombres?.[0] || "P"}
                    </div>
                    <div>
                      <p className="font-black text-2xl">
                        {postulanteConsulta?.nombres}{" "}
                        {postulanteConsulta?.primerApellido}{" "}
                        {postulanteConsulta?.segundoApellido}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <Badge
                          variant="outline"
                          className="font-bold border-primary/30"
                        >
                          CI: {postulanteConsulta?.nroDocumento}
                        </Badge>
                        <Badge
                          variant="default"
                          className="bg-primary font-bold"
                        >
                          Compras: {comprasConsulta.length}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="font-bold border-primary/30"
                        >
                          Recibos: {comprasConsulta.length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {/* {esCoordinadorGeneral && comprasConsulta.length > 0 && (
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
                      Descargar Compras (PDF)
                    </Button>
                  )} */}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-2">
                    <UserPlus className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-2xl font-black text-muted-foreground/50">
                    Postulante no encontrado
                  </h3>
                  <p className="text-muted-foreground max-w-xs">
                    No se encontró ningún postulante con el CI proporcionado.
                  </p>
                </div>
              )}
              {comprasConsulta.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 px-2">
                    <History className="h-5 w-5 text-primary" />
                    <h4 className="text-lg font-black">Recibos de ventas</h4>
                    <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">
                      {comprasConsulta.length}{" "}
                      {comprasConsulta.length === 1 ? "recibo" : "recibos"}
                    </Badge>
                  </div>

                  {comprasConsulta.map((venta: any, idx: number) => (
                    <Card
                      key={venta.numeroRecibo}
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
                              {venta.numeroRecibo.startsWith("REC-")
                                ? venta.numeroRecibo
                                : "Inscripción histórica"}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Calendar className="h-3 w-3" />
                              <span className="font-bold">
                                {new Date(
                                  venta.fechaCreacion,
                                ).toLocaleDateString("es-BO", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                              <span>
                                {new Date(
                                  venta.fechaCreacion,
                                ).toLocaleTimeString([], {
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
                              imprimiendoRecibo === venta.numeroRecibo ||
                              imprimiendoRecibo ===
                                `historico-${venta.detalles[0]?.id}`
                            }
                            onClick={() => handleIniciarReimpresion(venta)}
                            className="h-9 px-4 font-black border-primary/30 text-primary hover:bg-primary hover:text-white transition-all"
                          >
                            {imprimiendoRecibo === venta.numeroRecibo ||
                            imprimiendoRecibo ===
                              `historico-${venta.detalles[0]?.id}` ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Printer className="mr-2 h-4 w-4" />
                            )}
                            {venta.numeroRecibo.startsWith("REC-")
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
                              Producto
                            </TableHead>
                            <TableHead className="font-black text-xs uppercase tracking-widest pl-6">
                              Precio
                            </TableHead>
                            <TableHead className="font-black text-xs uppercase tracking-widest pl-6">
                              Cantidad
                            </TableHead>
                            <TableHead className="font-black text-xs uppercase tracking-widest text-right pr-6">
                              Monto
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {venta.detalles.map((vent: any) => (
                            <TableRow
                              key={vent.id}
                              className="hover:bg-primary/5 transition-colors group"
                            >
                              <TableCell className="py-4 pl-6">
                                <div>
                                  <p className="font-black text-sm group-hover:text-primary transition-colors line-clamp-1">
                                    {vent.producto?.nombre}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 pl-6">
                                <div>
                                  <p className="font-black text-sm group-hover:text-primary transition-colors line-clamp-1">
                                    {vent.precioUnitario}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 pl-6">
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                                    {vent.cantidad}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right py-4 pr-6">
                                <div className="flex flex-col items-end">
                                  <span className="font-mono font-black text-base text-primary">
                                    Bs. {vent.subtotal}
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
                          {venta.detalles
                            .reduce(
                              (acc: number, curr: any) =>
                                acc + Number(curr.subtotal),
                              0,
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                    </Card>
                  ))}

                  {/* Gran total */}
                  {comprasConsulta.length > 1 && (
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

              {comprasConsulta.length === 0 && postulanteConsulta && (
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
                        comprar({
                          nroDocumento: postulanteConsulta?.nroDocumento,
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
