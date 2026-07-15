"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { print } from "@/lib/print";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsuarioCoordinador } from "@/app/admin/(administracion)/cursos/types";
import { DatePickerSimple } from "@/components/DatePickerSimple";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RecaudacionData {
  total: number;
  cantidad: number;
}

type VendedorPrefa = {
  id: string;
  usuario: string;
  persona: {
    nombres: string;
    primerApellido: string;
    segundoApellido?: string;
  };
};

// ─── Sub-componente de filtros + KPIs ─────────────────────────────────────────

function RecaudacionPanel({
  titulo,
  subtitulo,
  labelUsuario,
  usuarios,
  endpoint,
  kpiLabel,
  kpiIcon,
}: {
  titulo: string;
  subtitulo: string;
  labelUsuario: string;
  usuarios: Array<{ id: string; label: string }>;
  endpoint: string;
  kpiLabel: string;
  kpiIcon: React.ReactNode;
}) {
  const { sessionRequest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RecaudacionData | null>(null);

  const [filtros, setFiltros] = useState({
    fechaInicio: dayjs.utc().format("YYYY-MM-DD"),
    fechaFin: dayjs.utc().format("YYYY-MM-DD"),
    idUsuario: "todos",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await sessionRequest<RecaudacionData>({
        url: endpoint,
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

  // Cargar al montar
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-0.5">
        <p className="font-semibold text-lg">{titulo}</p>
        <p className="text-muted-foreground text-sm">{subtitulo}</p>
      </div>

      {/* Filtros */}
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
          <FieldLabel className="tracking-wider mb-1 ml-1">
            {labelUsuario}
          </FieldLabel>
          <Select
            value={filtros.idUsuario}
            onValueChange={(value) =>
              setFiltros({ ...filtros, idUsuario: value })
            }
          >
            <SelectTrigger className="h-11 bg-background/50 rounded-xl border-white/10 focus:ring-primary/20 transition-all">
              <SelectValue placeholder={`Seleccione un ${labelUsuario.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-white/10 shadow-xl">
              <SelectItem value="todos">Todos</SelectItem>
              {usuarios.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Button
          onClick={fetchData}
          disabled={loading}
          className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          Actualizar Reporte
        </Button>
      </div>

      {/* KPIs */}
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
              {kpiLabel}
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {kpiIcon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-accent-foreground">
              {loading ? "..." : data?.cantidad || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium italic">
              Número total en el rango seleccionado
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

export default function Dashboard() {
  const { sessionRequest } = useAuth();

  const [coordinadores, setCoordinadores] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [vendedoresPrefas, setVendedoresPrefas] = useState<
    Array<{ id: string; label: string }>
  >([]);

  const user = useAuth().user;
  const rolActivo = user?.roles.find((rol) => user.idRol === rol.idRol);
  const esCoordinadorGeneral = rolActivo?.rol === "COORDINADOR GENERAL";
  const esAdministrador = rolActivo?.rol === "ADMINISTRADOR";

  const nombreCompleto = (p: {
    nombres: string;
    primerApellido: string;
    segundoApellido?: string;
  }) =>
    [p.nombres, p.primerApellido, p.segundoApellido]
      .filter(Boolean)
      .join(" ");

  useEffect(() => {
    if (!esCoordinadorGeneral && !esAdministrador) return;

    // Cargar coordinadores para la pestaña de inscripciones
    sessionRequest<{
      finalizado: boolean;
      datos: { filas: UsuarioCoordinador[]; total: number };
    }>({
      url: "/usuarios/coordinadores",
      method: "get",
    })
      .then((res) => {
        if (res) {
          setCoordinadores(
            res.data.datos.filas.map((c) => ({
              id: c.id,
              label: nombreCompleto(c.persona),
            }))
          );
        }
      })
      .catch((err) => print("Error fetching coordinators", err));

    // Cargar vendedores prefas para la pestaña de ventas
    sessionRequest<{ finalizado: boolean; datos: VendedorPrefa[] }>({
      url: "/usuarios/vendedores-prefas",
      method: "get",
    })
      .then((res) => {
        if (res) {
          setVendedoresPrefas(
            res.data.datos.map((v: VendedorPrefa) => ({
              id: v.id,
              label: nombreCompleto(v.persona),
            }))
          );
        }
      })
      .catch((err) => print("Error fetching vendedores prefas", err));

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
          Visualiza el resumen de ingresos en tiempo real.
        </p>
      </div>

      <Tabs defaultValue="inscripciones" className="w-full">
        <TabsList className="mb-6 rounded-xl h-11">
          <TabsTrigger value="inscripciones" className="rounded-lg px-6">
            Inscripciones
          </TabsTrigger>
          <TabsTrigger value="prefas" className="rounded-lg px-6">
            Ventas Prefas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inscripciones">
          <RecaudacionPanel
            titulo="Recaudación por Inscripciones"
            subtitulo="Ingresos generados por inscripciones a cursos, filtrados por coordinador."
            labelUsuario="Coordinador de Curso"
            usuarios={coordinadores}
            endpoint="/dashboard/recaudacion"
            kpiLabel="Inscripciones"
            kpiIcon={<Users className="h-5 w-5" />}
          />
        </TabsContent>

        <TabsContent value="prefas">
          <RecaudacionPanel
            titulo="Recaudación por Ventas Prefas"
            subtitulo="Ingresos generados por ventas en el módulo prefacultativo, filtrados por vendedor."
            labelUsuario="Vendedor"
            usuarios={vendedoresPrefas}
            endpoint="/dashboard/recaudacion-prefas"
            kpiLabel="Ventas realizadas"
            kpiIcon={<ShoppingCart className="h-5 w-5" />}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
