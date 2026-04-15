"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "sonner";
import {
  Search,
  UserPlus,
  Trash2,
  BookOpen,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  FileText,
  Download,
  Loader2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { print } from "@/lib/print";
import { EstudianteBusqueda } from "../cursos/[id]/inscritos/types";
import { Curso, Paralelo } from "../cursos/types";
import { Constants } from "@/config/Constants";

export default function NuevaInscripcionPage() {
  const { sessionRequest } = useAuth();

  // Estado para Estudiante
  const [nroDocumento, setNroDocumento] = useState("");
  const [estudiante, setEstudiante] = useState<EstudianteBusqueda | null>(null);
  const [loadingEstudiante, setLoadingEstudiante] = useState(false);

  // Estado para Cursos y Selección
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [idCursoSeleccionado, setIdCursoSeleccionado] = useState<string>("");
  const [idParaleloSeleccionado, setIdParaleloSeleccionado] =
    useState<string>("");

  // Bandeja de Inscripciones (Carrito)
  const [carrito, setCarrito] = useState<{ curso: Curso; paralelo: Paralelo }[]>(
    [],
  );

  // Estado de Procesamiento
  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState(false);

  // IDs de inscripciones creadas (para el recibo)
  const [idsInscripcionCreadas, setIdsInscripcionCreadas] = useState<string[]>(
    [],
  );
  const [generandoRecibo, setGenerandoRecibo] = useState(false);

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    setLoadingCursos(true);
    try {
      const response = await sessionRequest<any>({
        url: "/cursos",
        method: "get",
      });
      if (response && response.data?.datos?.filas) {
        setCursos(response.data.datos.filas);
      }
    } catch (error) {
      print("Error fetching cursos", error);
    } finally {
      setLoadingCursos(false);
    }
  };

  const handleSearchEstudiante = async () => {
    if (!nroDocumento.trim()) return;
    setLoadingEstudiante(true);
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
      setLoadingEstudiante(false);
    }
  };

  const agregarAlCarrito = () => {
    const curso = cursos.find((c) => c.id === idCursoSeleccionado);
    const paralelo = curso?.paralelos.find(
      (p) => p.id === idParaleloSeleccionado,
    );

    if (!curso || !paralelo) {
      toast.error("Seleccione un curso y un paralelo válido");
      return;
    }

    // Evitar duplicados de curso
    if (carrito.find((item) => item.curso.id === curso.id)) {
      toast.error(
        "El estudiante ya está siendo inscrito en este curso en esta sesión",
      );
      return;
    }

    setCarrito([...carrito, { curso, paralelo }]);
    setIdCursoSeleccionado("");
    setIdParaleloSeleccionado("");
  };

  const quitarDelCarrito = (index: number) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };

  const totalMonto = carrito.reduce(
    (acc, item) => acc + Number(item.curso.monto),
    0,
  );

  const handleFinalizarInscripcion = async () => {
    if (!estudiante) return;
    if (carrito.length === 0) {
      toast.error("La bandeja de inscripciones está vacía");
      return;
    }

    setProcesando(true);
    try {
      const response = await sessionRequest<{ datos: any[] }>({
        url: "/inscripciones/multiple",
        method: "post",
        data: {
          idEstudiante: estudiante.id,
          idsParalelo: carrito.map((item) => item.paralelo.id),
        },
      });

      // Extraer IDs de las inscripciones creadas para el recibo
      const inscripciones = response?.data?.datos || [];
      const ids = inscripciones.map((ins) => ins.id);
      setIdsInscripcionCreadas(ids);

      toast.success("Inscrito correctamente en todos los cursos");
      setExito(true);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.mensaje || "Error al procesar inscripciones",
      );
    } finally {
      setProcesando(false);
    }
  };

  const downloadReceipt = async () => {
    if (idsInscripcionCreadas.length === 0) return;
    setGenerandoRecibo(true);
    try {
      const response = await sessionRequest<Blob>({
        url: "/inscripciones/multiple/recibo",
        method: "post",
        data: {
          idsInscripcion: idsInscripcionCreadas,
        },
        responseType: "blob",
      });

      if (response && response.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `recibo-inscripcion-${new Date().getTime()}.pdf`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Recibo generado correctamente");
      }
    } catch (error) {
      print("Error generating receipt", error);
      toast.error("Error al generar el recibo PDF");
    } finally {
      setGenerandoRecibo(false);
    }
  };

  const reset = () => {
    setNroDocumento("");
    setEstudiante(null);
    setCarrito([]);
    setIdCursoSeleccionado("");
    setIdParaleloSeleccionado("");
    setExito(false);
    setIdsInscripcionCreadas([]);
  };

  if (exito) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in zoom-in duration-500 px-4">
        <div className="relative">
          <div className="h-32 w-32 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center ring-8 ring-green-50 dark:ring-green-900/10">
            <CheckCircle2 className="h-16 w-16 text-green-600 animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2 h-10 w-10 bg-white dark:bg-slate-900 rounded-full shadow-lg flex items-center justify-center border-4 border-green-500">
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-4xl font-black tracking-tight bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent pb-1">
            ¡Inscripción Completada!
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-lg">
            El estudiante <span className="font-bold text-foreground text-primary">{estudiante?.usuario.persona.nombres} {estudiante?.usuario.persona.primerApellido}</span> ha sido inscrito correctamente en {carrito.length} cursos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button
            onClick={downloadReceipt}
            disabled={generandoRecibo}
            className="flex-1 h-16 text-lg font-bold gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform"
            size="lg"
          >
            {generandoRecibo ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Download className="h-6 w-6" />
            )}
            Descargar Recibo
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            className="flex-1 h-16 text-lg font-bold gap-3 border-2"
            size="lg"
          >
            <UserPlus className="h-6 w-6" />
            Nueva Inscripción
          </Button>
        </div>

        <Card className="w-full max-w-md border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center text-sm mb-4 text-muted-foreground uppercase tracking-wider font-bold">
              <span>Resumen de Pago</span>
              <span>Confirmado</span>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-3">
              {carrito.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="text-left">
                    <p className="font-bold text-sm">{item.curso.nombre}</p>
                    <p className="text-xs text-muted-foreground">{item.paralelo.nombre}</p>
                  </div>
                  <span className="font-mono font-bold">Bs. {item.curso.monto}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center">
              <span className="font-black text-lg">TOTAL PAGADO</span>
              <span className="text-2xl font-black text-primary">Bs. {totalMonto.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 container py-10 px-2 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent pb-1">
            Inscripción General
          </h1>
          <p className="text-muted-foreground">
            Sistema de cobro y registro múltiple de estudiantes.
          </p>
        </div>
        <Badge variant="outline" className="h-8 px-4 border-primary/30 bg-primary/5 text-primary text-xs font-bold tracking-widest uppercase">
          Procesamiento Transaccional
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-8">
          {/* SECCIÓN 1: ESTUDIANTE */}
          <Card className="overflow-hidden border-2 border-primary/10 shadow-xl shadow-primary/5 bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="bg-primary/5 border-b border-primary/10 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">Paso 1: Estudiante</CardTitle>
                  <CardDescription className="text-base">
                    Verificación de identidad y estado académico
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 w-full space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Documento de Identidad (CI)</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Ej. 8457214"
                      value={nroDocumento}
                      onChange={(e) => setNroDocumento(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSearchEstudiante()
                      }
                      className="h-14 pl-12 text-lg font-bold bg-muted/50 border-2 focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSearchEstudiante}
                  disabled={loadingEstudiante || !nroDocumento}
                  className="h-14 px-10 text-lg font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  size="lg"
                >
                  {loadingEstudiante ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    "BUSCAR ESTUDIANTE"
                  )}
                </Button>
              </div>

              {estudiante && (
                <div className="mt-8 p-6 rounded-3xl border-2 border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-primary/20">
                      {estudiante.usuario.persona.nombres[0]}
                    </div>
                    <div>
                      <p className="font-black text-2xl tracking-tighter">
                        {estudiante.usuario.persona.nombres}{" "}
                        {estudiante.usuario.persona.primerApellido}{" "}
                        {estudiante.usuario.persona.segundoApellido}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <Badge variant="secondary" className="font-bold">{estudiante.usuario.correoElectronico}</Badge>
                        <Badge variant="outline" className="font-bold border-primary/30">CI: {estudiante.usuario.persona.nroDocumento}</Badge>
                        {estudiante.codigoPersonal && (
                          <Badge variant="default" className="bg-primary hover:bg-primary font-bold">Matrícula: {estudiante.codigoPersonal}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => reset()}
                    className="text-muted-foreground hover:text-destructive font-black text-xs uppercase tracking-widest gap-2"
                  >
                    <Undo2 className="h-4 w-4" /> Cambiar Estudiante
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECCIÓN 2: CURSOS */}
          {estudiante && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-700">
              <Card className="h-fit border-2 border-primary/5 shadow-xl shadow-primary/5 flex flex-col overflow-hidden">
                <CardHeader className="bg-card px-8 pt-8 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl font-black">Paso 2: Selección</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8 space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                      Curso Académico
                    </label>
                    <Select
                      value={idCursoSeleccionado}
                      onValueChange={(val) => {
                        setIdCursoSeleccionado(val);
                        setIdParaleloSeleccionado("");
                      }}
                    >
                      <SelectTrigger className="h-14 w-full text-base font-bold bg-muted/30 border-2">
                        <SelectValue placeholder="Seleccione un curso..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cursos.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="font-bold">
                            {c.nombre} <span className="text-primary ml-2">— Bs. {c.monto}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {idCursoSeleccionado && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                        Paralelo / Turno
                      </label>
                      <Select
                        value={idParaleloSeleccionado}
                        onValueChange={setIdParaleloSeleccionado}
                      >
                        <SelectTrigger className="h-14 w-full text-base font-bold bg-muted/30 border-2">
                          <SelectValue placeholder="Seleccione un paralelo..." />
                        </SelectTrigger>
                        <SelectContent>
                          {cursos
                            .find((c) => c.id === idCursoSeleccionado)
                            ?.paralelos.map((p) => (
                              <SelectItem
                                key={p.id}
                                value={p.id}
                                disabled={(p.cupo ?? 0) === 0}
                                className="font-bold text-sm"
                              >
                                {p.nombre} ({p.cupo ?? 0} cupos disponibles)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button
                    className="w-full h-16 text-lg font-black shadow-lg shadow-primary/10 active:scale-95 transition-all"
                    disabled={!idParaleloSeleccionado}
                    onClick={agregarAlCarrito}
                  >
                    AGREGAR A LA BANDEJA <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* SECCIÓN 3: BANDEJA (CARRITO) */}
              <Card className="md:row-span-2 border-2 border-primary/5 shadow-2xl flex flex-col overflow-hidden bg-gradient-to-br from-card to-primary/5">
                <CardHeader className="bg-card px-8 pt-8 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-xl font-black">Paso 3: Bandeja</CardTitle>
                    </div>
                    <div className="h-8 px-3 rounded-lg bg-primary text-white text-[10px] font-black flex items-center gap-2">
                      {carrito.length} ÍTEMS
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col">
                  <div className="flex-1 overflow-auto min-h-[300px]">
                    <Table>
                      <TableHeader className="bg-muted/50 sticky top-0 z-10">
                        <TableRow className="hover:bg-transparent border-0">
                          <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest h-12">Detalle de Cobro</TableHead>
                          <TableHead className="text-right text-[10px] font-black uppercase tracking-widest h-12">Importe</TableHead>
                          <TableHead className="w-[80px] h-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {carrito.length === 0 ? (
                          <TableRow className="hover:bg-transparent">
                            <TableCell
                              colSpan={3}
                              className="h-64 text-center"
                            >
                              <div className="flex flex-col items-center gap-4 text-muted-foreground/40">
                                <BookOpen className="h-12 w-12 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-widest">Bandeja Vacía</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          carrito.map((item, index) => (
                            <TableRow key={index} className="hover:bg-primary/5 transition-colors border-primary/5 group">
                              <TableCell className="pl-8 py-5">
                                <p className="font-black text-base text-foreground group-hover:text-primary transition-colors">
                                  {item.curso.nombre}
                                </p>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                  Paralelo: {item.paralelo.nombre}
                                </p>
                              </TableCell>
                              <TableCell className="text-right font-mono font-black text-base py-5">
                                Bs. {item.curso.monto}
                              </TableCell>
                              <TableCell className="pr-6 py-5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => quitarDelCarrito(index)}
                                  className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="p-8 space-y-8 bg-card border-t border-primary/5 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Total Liquidación</span>
                        <span className="text-lg font-black text-foreground">BOLIVIANOS</span>
                      </div>
                      <span className="text-5xl font-black text-primary tracking-tighter">
                        Bs. {totalMonto.toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <Button
                        className="w-full h-20 text-xl font-black shadow-2xl shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all gap-4"
                        disabled={carrito.length === 0 || procesando}
                        onClick={handleFinalizarInscripcion}
                      >
                        {procesando ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                          <>
                            <FileText className="h-8 w-8" />
                            FINALIZAR Y COBRAR
                          </>
                        )}
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground/60 uppercase tracking-[0.25em] font-black leading-normal">
                        Operación protegida por firma electrónica<br />y validación de identidad
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
