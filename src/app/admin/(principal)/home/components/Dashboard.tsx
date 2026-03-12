"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, DollarSign } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard de Recaudación
        </h2>
        <p className="text-muted-foreground">
          Visualiza el resumen de ingresos por inscripciones.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 bg-muted/20 p-4 rounded-lg border">
        <Field className="w-full md:w-48">
          <DatePickerSimple
            label="Fecha Inicio"
            value={filtros.fechaInicio}
            onChange={(e) => setFiltros({ ...filtros, fechaInicio: e ?? "" })}
          />
        </Field>
        <Field className="w-full md:w-48">
          <DatePickerSimple
            label="Fecha Fin"
            value={filtros.fechaFin}
            onChange={(e) => setFiltros({ ...filtros, fechaFin: e ?? "" })}
          />
        </Field>
        <Field className="w-full md:w-64">
          <FieldLabel>Coordinador de Curso</FieldLabel>
          <Select
            value={filtros.idUsuario}
            onValueChange={(value) =>
              setFiltros({ ...filtros, idUsuario: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un coordinador" />
            </SelectTrigger>
            <SelectContent>
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
        <Button onClick={fetchRecaudacion} disabled={loading}>
          Actualizar Reporte
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Recaudado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${data?.total.toFixed(2) || "0.00"} Bs.`}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos totales en el rango seleccionado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inscripciones Realizadas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : data?.cantidad || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Número total de estudiantes inscritos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for future charts */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Resumen Visual</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-md bg-muted/10">
            <div className="flex flex-col items-center text-muted-foreground">
              <BarChart3 className="h-8 w-8 mb-2" />
              <span>Próximamente: Gráficos detallados de ingresos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
