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
  const [carrito, setCarrito] = useState<
    { curso: Curso; paralelo: Paralelo }[]
  >([]);

  // Estado de Procesamiento
  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState(false);

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
      await sessionRequest({
        url: "/inscripciones/multiple",
        method: "post",
        data: {
          idEstudiante: estudiante.id,
          idsParalelo: carrito.map((item) => item.paralelo.id),
        },
      });
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

  if (exito) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">¡Inscripción Exitosa!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {estudiante?.usuario.persona.nombres} ha sido inscrito en{" "}
            {carrito.length} cursos correctamente.
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="lg"
        >
          Realizar otra inscripción
        </Button>
      </div>
    );
  }

  const reset = () => {
    setEstudiante(null);
    setCarrito([]);
    setIdCursoSeleccionado("");
    setIdParaleloSeleccionado("");
  };

  return (
    <div className="space-y-8 container py-10 px-2">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gradient">Nueva Inscripción Generalu</h1>
        <p className="text-muted-foreground">
          Inscribe a un estudiante en múltiples cursos simultáneamente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna Izquierda: Selección */}
        <div className="lg:col-span-12 space-y-8">
          {/* SECCIÓN 1: ESTUDIANTE */}
          <Card className="overflow-hidden border-primary/20 bg-muted/20 p-8">
            <CardHeader className="bg-primary/5 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Paso 1: Identificar Estudiante</CardTitle>
                  <CardDescription>
                    Busca el estudiante por su número de documento
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-end gap-4">
                <div className="flex-1 max-w-sm space-y-2">
                  <Input
                    placeholder="Ingrese CI del estudiante"
                    value={nroDocumento}
                    onChange={(e) => setNroDocumento(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSearchEstudiante()
                    }
                    className="h-11"
                  />
                </div>
                <Button
                  onClick={handleSearchEstudiante}
                  disabled={loadingEstudiante}
                  className="h-11"
                  variant="secondary"
                >
                  {loadingEstudiante ? (
                    "Buscando..."
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" /> Buscar
                    </>
                  )}
                </Button>
              </div>

              {estudiante && (
                <div className="mt-6 p-4 rounded-xl border bg-card flex items-center justify-between animate-in slide-in-from-left-2 duration-300">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {estudiante.usuario.persona.nombres[0]}
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-none">
                        {estudiante.usuario.persona.nombres}{" "}
                        {estudiante.usuario.persona.primerApellido}{" "}
                        {estudiante.usuario.persona.segundoApellido}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {estudiante.usuario.correoElectronico} • CI:{" "}
                        {estudiante.usuario.persona.nroDocumento}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reset()}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    Cambiar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECCIÓN 2: CURSOS */}
          {estudiante && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
              <Card className="h-fit p-4 py-8">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle>Paso 2: Agregar Cursos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Seleccionar Curso
                    </label>
                    <Select
                      value={idCursoSeleccionado}
                      onValueChange={setIdCursoSeleccionado}
                    >
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Seleccione un curso..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cursos.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nombre} (Bs. {c.monto})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {idCursoSeleccionado && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <label className="text-sm font-medium">
                        Seleccionar Paralelo
                      </label>
                      <Select
                        value={idParaleloSeleccionado}
                        onValueChange={setIdParaleloSeleccionado}
                      >
                        <SelectTrigger className="h-11 w-full">
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
                              >
                                {p.nombre} ({p.cupo ?? 0} cupos disp.)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button
                    className="w-full h-11"
                    disabled={!idParaleloSeleccionado}
                    onClick={agregarAlCarrito}
                  >
                    Agregar a la Bandeja <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* SECCIÓN 3: BANDEJA (CARRITO) */}
              <Card className="md:row-span-2 p-4 py-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <CardTitle>Paso 3: Bandeja de Inscripción</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-primary/5">
                      {carrito.length} ítems
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="min-h-[200px]">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="pl-6">
                            Curso / Paralelo
                          </TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {carrito.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="h-32 text-center text-muted-foreground"
                            >
                              Agregue cursos para comenzar
                            </TableCell>
                          </TableRow>
                        ) : (
                          carrito.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="pl-6">
                                <p className="font-semibold text-sm">
                                  {item.curso.nombre}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Paralelo: {item.paralelo.nombre}
                                </p>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                Bs. {item.curso.monto}
                              </TableCell>
                              <TableCell className="pr-4">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => quitarDelCarrito(index)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="p-6 space-y-6">
                    <Separator />
                    <div className="flex justify-between items-center px-2">
                      <span className="text-lg font-bold">TOTAL A PAGAR</span>
                      <span className="text-2xl font-black text-primary tracking-tight">
                        Bs. {totalMonto.toFixed(2)}
                      </span>
                    </div>

                    <Button
                      className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20"
                      disabled={carrito.length === 0 || procesando}
                      onClick={handleFinalizarInscripcion}
                    >
                      {procesando ? "Procesando..." : "Finalizar y Cobrar Todo"}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
                      Se generará una inscripción para cada curso seleccionado
                    </p>
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
