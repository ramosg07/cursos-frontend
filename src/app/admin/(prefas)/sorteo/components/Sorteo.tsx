"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthProvider";
import { MessageInterpreter } from "@/lib/messageInterpreter";
import { Dices, LoaderCircle, Printer, Repeat2, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AsignacionSorteo,
  Examen,
  usePrefasApi,
} from "../../services/prefas.api";

export function Sorteo() {
  const api = usePrefasApi();
  const { checkPermission, sessionRequest } = useAuth();
  const [examenes, setExamenes] = useState<Examen[]>([]);
  const [idExamen, setIdExamen] = useState("");
  const [asignaciones, setAsignaciones] = useState<AsignacionSorteo[]>([]);
  const [cargandoExamenes, setCargandoExamenes] = useState(true);
  const [cargandoAsignaciones, setCargandoAsignaciones] = useState(false);
  const [sorteando, setSorteando] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [puedeCrear, setPuedeCrear] = useState(false);
  const [puedeActualizar, setPuedeActualizar] = useState(false);
  const [asignacionAIntercambiar, setAsignacionAIntercambiar] =
    useState<AsignacionSorteo | null>(null);
  const [idAsignacionDestino, setIdAsignacionDestino] = useState("");
  const [intercambiando, setIntercambiando] = useState(false);

  useEffect(() => {
    const inicializar = async () => {
      try {
        const [respuesta, permisoCrear, permisoActualizar] = await Promise.all([
          sessionRequest<any>({
            url: "/examenes",
            method: "GET",
            params: { pagina: 1, limite: 50 },
          }),
          checkPermission("/admin/sorteo", "create"),
          checkPermission("/admin/sorteo", "update"),
        ]);
        setExamenes(respuesta?.data?.datos?.filas ?? []);
        setPuedeCrear(permisoCrear);
        setPuedeActualizar(permisoActualizar);
      } catch (error) {
        toast.error(MessageInterpreter(error));
      } finally {
        setCargandoExamenes(false);
      }
    };

    inicializar();
  }, [checkPermission, sessionRequest]);

  const cargarAsignaciones = useCallback(async () => {
    if (!idExamen) return;

    setCargandoAsignaciones(true);
    try {
      setAsignaciones(await api.getAsignacionesSorteo(idExamen));
    } catch (error) {
      setAsignaciones([]);
      toast.error(MessageInterpreter(error));
    } finally {
      setCargandoAsignaciones(false);
    }
  }, [api, idExamen]);

  const realizarSorteo = async () => {
    if (!idExamen) {
      toast.error("Selecciona un examen antes de realizar el sorteo.");
      return;
    }

    setSorteando(true);
    try {
      const resultado = await api.realizarSorteo(idExamen);
      toast.success(
        `Sorteo realizado para ${resultado.totalPostulantes} postulantes.`,
      );
    } catch (error) {
      toast.error(MessageInterpreter(error));
    } finally {
      setSorteando(false);
    }
  };

  const imprimirAsignaciones = async () => {
    if (!idExamen) {
      toast.error("Selecciona un examen antes de imprimir las asignaciones.");
      return;
    }
    setGenerandoPdf(true);
    try {
      const pdf = await api.generarPdfAsignacionesSorteo(idExamen);
      const url = window.URL.createObjectURL(new Blob([pdf]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `asignaciones-${idExamen}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(MessageInterpreter(error));
    } finally {
      setGenerandoPdf(false);
    }
  };

  const abrirIntercambio = (asignacion: AsignacionSorteo) => {
    setAsignacionAIntercambiar(asignacion);
    setIdAsignacionDestino("");
  };

  const intercambiar = async () => {
    if (!asignacionAIntercambiar || !idAsignacionDestino) return;

    setIntercambiando(true);
    try {
      await api.intercambiarAsignacionesSorteo(
        asignacionAIntercambiar.id,
        idAsignacionDestino,
      );
      toast.success("Los asientos se intercambiaron correctamente.");
      setAsignacionAIntercambiar(null);
      await cargarAsignaciones();
    } catch (error) {
      toast.error(MessageInterpreter(error));
    } finally {
      setIntercambiando(false);
    }
  };

  const nombreCompleto = (postulante: AsignacionSorteo["postulante"]) =>
    [postulante.nombres, postulante.primerApellido, postulante.segundoApellido]
      .filter(Boolean)
      .join(" ");

  return (
    <div>
      <div>
        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent pb-1">
          Asignación de aulas y asientos
        </h1>
        <p className="text-muted-foreground">
          Selecciona un examen, realiza el sorteo una sola vez y consulta las
          asignaciones generadas.
        </p>
      </div>
      <Card className="mt-6 p-4">
        <CardContent className="space-y-6 pb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="grid w-full max-w-md gap-2">
              <Label htmlFor="examen">Examen</Label>
              <Select value={idExamen} onValueChange={setIdExamen}>
                <SelectTrigger id="examen" className="w-full">
                  <SelectValue
                    placeholder={
                      cargandoExamenes ? "Cargando..." : "Selecciona un examen"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {examenes.map((examen) => (
                    <SelectItem key={examen.id} value={examen.id}>
                      {examen.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={cargarAsignaciones}
                disabled={!idExamen || cargandoAsignaciones}
              >
                {cargandoAsignaciones ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Consultar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={imprimirAsignaciones}
                disabled={!idExamen || generandoPdf}
              >
                {generandoPdf ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="mr-2 h-4 w-4" />
                )}
                Imprimir asientos
              </Button>
              {puedeCrear && (
                <Button
                  type="button"
                  onClick={realizarSorteo}
                  disabled={!idExamen || sorteando}
                >
                  {sorteando ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Dices className="mr-2 h-4 w-4" />
                  )}
                  Realizar sorteo
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Postulante</TableHead>
                  <TableHead>Aula</TableHead>
                  <TableHead>Asiento</TableHead>
                  {puedeActualizar && <TableHead>Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {asignaciones.map((asignacion, index) => (
                  <TableRow key={asignacion.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{asignacion.postulante?.nroDocumento}</TableCell>
                    <TableCell>
                      {nombreCompleto(asignacion?.postulante)}
                    </TableCell>
                    <TableCell>{asignacion.aula.nombre}</TableCell>
                    <TableCell>{`${asignacion.fila}${asignacion.columna}`}</TableCell>
                    {puedeActualizar && (
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => abrirIntercambio(asignacion)}
                        >
                          <Repeat2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {!cargandoAsignaciones && asignaciones.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={puedeActualizar ? 6 : 5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Selecciona un examen y consulta sus asignaciones.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <Dialog
          open={!!asignacionAIntercambiar}
          onOpenChange={(abierto) => {
            if (!abierto) setAsignacionAIntercambiar(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Intercambiar asignación</DialogTitle>
              <DialogDescription>
                {asignacionAIntercambiar && (
                  <>
                    {nombreCompleto(asignacionAIntercambiar.postulante)} tiene
                    asignado {asignacionAIntercambiar.aula.nombre}, asiento{" "}
                    {asignacionAIntercambiar.fila}
                    {asignacionAIntercambiar.columna}. Selecciona con quién
                    intercambiará ese asiento.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="asignacion-destino">Intercambiar con</Label>
              <Select
                value={idAsignacionDestino}
                onValueChange={setIdAsignacionDestino}
              >
                <SelectTrigger id="asignacion-destino" className="w-full">
                  <SelectValue placeholder="Selecciona un postulante" />
                </SelectTrigger>
                <SelectContent>
                  {asignaciones
                    .filter(
                      (asignacion) =>
                        asignacion.id !== asignacionAIntercambiar?.id,
                    )
                    .map((asignacion) => (
                      <SelectItem key={asignacion.id} value={asignacion.id}>
                        {nombreCompleto(asignacion?.postulante)} —{" "}
                        {asignacion.aula.nombre} {asignacion.fila}
                        {asignacion.columna}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAsignacionAIntercambiar(null)}
                disabled={intercambiando}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={intercambiar}
                disabled={!idAsignacionDestino || intercambiando}
              >
                {intercambiando && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirmar intercambio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
