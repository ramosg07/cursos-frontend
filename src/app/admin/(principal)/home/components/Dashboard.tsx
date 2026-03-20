"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { print } from "@/lib/print";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UsuarioCoordinador } from "@/app/admin/(administracion)/cursos/types";
import { DatePickerSimple } from "@/components/DatePickerSimple";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

interface RecaudacionData {
  total: number;
  cantidad: number;
}

export default function Dashboard() {
  const { sessionRequest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RecaudacionData | null>(null);

  const [filtros, setFiltros] = useState({
    fechaInicio: dayjs.utc().format("YYYY-MM-DD") || "",
    fechaFin: dayjs.utc().format("YYYY-MM-DD") || "",
    idUsuario: "todos",
  });

  const [coordinadores, setCoordinadores] = useState<UsuarioCoordinador[]>([]);

  const user = useAuth().user;
  const rolActivo = user?.roles.find((rol) => user.idRol === rol.idRol);
  const esCoordinadorGeneral = rolActivo?.rol === "COORDINADOR GENERAL";
  const esAdministrador = rolActivo?.rol === "ADMINISTRADOR";

  const fetchRecaudacion = async () => {
    setLoading(true);
    try {
      const response = await sessionRequest<RecaudacionData>({
        url: "/dashboard/recaudacion",
        method: "get",
        params: {
          fechaInicio: dayjs(filtros.fechaInicio).startOf("day").toISOString(),
          fechaFin: dayjs(filtros.fechaFin).endOf("day").toISOString(),
          idUsuario:
            filtros.idUsuario === "todos" ? undefined : filtros.idUsuario,
        },
      });
      if (response) {
        setData(response.data);
      }
    } catch (error: any) {
      print("Error fetching revenue", error);
      toast.error("Error al cargar los datos de recaudación");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordinadores = async () => {
    try {
      const response = await sessionRequest<{
        finalizado: boolean;
        datos: { filas: UsuarioCoordinador[]; total: number };
      }>({
        url: "/usuarios/coordinadores",
        method: "get",
      });
      if (response) {
        setCoordinadores(response.data.datos.filas);
      }
    } catch (error) {
      print("Error fetching coordinators", error);
    }
  };

  useEffect(() => {
    if (esCoordinadorGeneral || esAdministrador) {
      fetchRecaudacion();
      fetchCoordinadores();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!esCoordinadorGeneral && !esAdministrador) {
    return <></>;
  }

  return (
    <div className="space-y-8 animate-fade-in pt-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold tracking-tight text-gradient">
          Dashboard de Recaudación
        </h2>
        <p className="text-muted-foreground font-medium">
          Visualiza el resumen de ingresos por inscripciones en tiempo real.
        </p>
      </div>

      <div className="glass p-6 rounded-2xl border-white/10 shadow-lg flex flex-wrap items-end gap-6">
        <Field className="w-full md:w-56">
          <DatePickerSimple
            label="Fecha Inicio"
            value={filtros.fechaInicio}
            onChange={(e) => setFiltros({ ...filtros, fechaInicio: e ?? "" })}
          />
        </Field>
        <Field className="w-full md:w-56">
          <DatePickerSimple
            label="Fecha Fin"
            value={filtros.fechaFin}
            onChange={(e) => setFiltros({ ...filtros, fechaFin: e ?? "" })}
          />
        </Field>
        <Field className="w-full md:w-72">
          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 ml-1">
            Coordinador de Curso
          </FieldLabel>
          <Select
            value={filtros.idUsuario}
            onValueChange={(value) =>
              setFiltros({ ...filtros, idUsuario: value })
            }
          >
            <SelectTrigger className="h-11 bg-background/50 rounded-xl border-white/10 focus:ring-primary/20 transition-all">
              <SelectValue placeholder="Seleccione un coordinador" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/10 shadow-xl">
              <SelectItem value="todos">Todos los coordinadores</SelectItem>
              {coordinadores.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.persona.nombres} {c.persona.primerApellido}{" "}
                  {c.persona.segundoApellido || ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button
          onClick={fetchRecaudacion}
          disabled={loading}
          className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          Actualizar Reporte
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden border-none glass-card group p-4 pb-6">
          <div className="absolute top-20 right-15 w-80 h-80 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Total Recaudado
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-primary">
              {loading ? "..." : `${data?.total.toFixed(2) || "0.00"} Bs.`}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium italic">
              Ingresos totales en el rango seleccionado
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-none glass-card group p-4 pb-6">
          <div className="absolute top-20 right-15 w-80 h-80 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Inscripciones
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-accent-foreground">
              {loading ? "..." : data?.cantidad || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium italic">
              Número total de estudiantes inscritos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* <Card className="border-none glass group overflow-hidden py-6">
        <CardHeader className="border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">Resumen Visual</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="h-[250px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
            <div className="flex flex-col items-center text-muted-foreground/60">
              <BarChart3 className="h-10 w-10 mb-3 animate-float" />
              <span className="font-semibold tracking-wide uppercase text-xs">
                Próximamente
              </span>
              <span className="text-sm mt-1">
                Gráficos detallados de ingresos
              </span>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
