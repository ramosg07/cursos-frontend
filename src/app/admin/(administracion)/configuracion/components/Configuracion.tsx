"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  LayoutDashboard,
  Save,
  Loader2,
  DollarSign,
  QrCode,
  Banknote,
  GraduationCap,
  BookUser,
  UserRoundCog,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { print } from "@/lib/print";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DashboardConfig {
  id: string;
  modoManual: boolean;
  totalRecaudado: number;
  totalQR: number;
  totalEfectivo: number;
  totalEstudiantes: number;
  totalDocentes: number;
  totalExternos: number;
  totalInscritos: number;
}

const defaultConfig: Omit<DashboardConfig, "id"> = {
  modoManual: false,
  totalRecaudado: 0,
  totalQR: 0,
  totalEfectivo: 0,
  totalEstudiantes: 0,
  totalDocentes: 0,
  totalExternos: 0,
  totalInscritos: 0,
};

// ─── Campo numérico reutilizable ──────────────────────────────────────────────

function CampoNumerico({
  label,
  value,
  onChange,
  icon,
  prefix,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  prefix?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <div className="relative">
        <Input
          type="number"
          step={prefix ? "0.01" : "1"}
          min="0"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="h-11 rounded-xl bg-background/50 border-white/10 focus:ring-primary/20 transition-all pl-4 pr-14"
        />
        {prefix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
            {prefix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const Configuracion = () => {
  const { sessionRequest } = useAuth();

  // const [config, setConfig] = useState<DashboardConfig | null>(null);
  const [form, setForm] = useState<Omit<DashboardConfig, "id">>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ─── Cargar configuración ──────────────────────────────────────────────────

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await sessionRequest<{
        finalizado: boolean;
        datos: DashboardConfig;
      }>({
        url: "/dashboard/config",
        method: "get",
      });
      if (response) {
        const data = response.data.datos;
        // setConfig(data);
        setForm({
          modoManual: data.modoManual,
          totalRecaudado: Number(data.totalRecaudado),
          totalQR: Number(data.totalQR),
          totalEfectivo: Number(data.totalEfectivo),
          totalEstudiantes: Number(data.totalEstudiantes),
          totalDocentes: Number(data.totalDocentes),
          totalExternos: Number(data.totalExternos),
          totalInscritos: Number(data.totalInscritos),
        });
      }
    } catch (error: any) {
      print("Error fetching dashboard config", error);
      toast.error("Error al cargar la configuración del dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Guardar configuración ─────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await sessionRequest<{
        finalizado: boolean;
        datos: DashboardConfig;
      }>({
        url: "/dashboard/config",
        method: "patch",
        data: form,
      });
      if (response) {
        const data = response.data.datos;
        // setConfig(data);
        setForm({
          modoManual: data.modoManual,
          totalRecaudado: Number(data.totalRecaudado),
          totalQR: Number(data.totalQR),
          totalEfectivo: Number(data.totalEfectivo),
          totalEstudiantes: Number(data.totalEstudiantes),
          totalDocentes: Number(data.totalDocentes),
          totalExternos: Number(data.totalExternos),
          totalInscritos: Number(data.totalInscritos),
        });
        toast.success("Configuración del dashboard guardada correctamente");
      }
    } catch (error: any) {
      print("Error saving dashboard config", error);
      toast.error("Error al guardar la configuración del dashboard");
    } finally {
      setSaving(false);
    }
  };

  // ─── Actualizar campo del formulario ───────────────────────────────────────

  const updateField = (field: keyof Omit<DashboardConfig, "id">, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-fade-in pt-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold tracking-tight text-gradient">
          Configuración
        </h2>
        <p className="text-muted-foreground font-medium">
          Gestiona las opciones de configuración del sistema.
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6 rounded-xl h-11">
          <TabsTrigger value="dashboard" className="rounded-lg px-6">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="otros" className="rounded-lg px-6">
            <Settings className="h-4 w-4 mr-2" />
            Otros
          </TabsTrigger>
        </TabsList>

        {/* ─── Pestaña Dashboard ─────────────────────────────────────── */}
        <TabsContent value="dashboard">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">
                Cargando configuración...
              </span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Switch Modo Manual */}
              <Card className="border-none glass-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Modo Manual del Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-white/10">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold">Activar Modo Manual</p>
                      <p className="text-sm text-muted-foreground">
                        Al activar, el dashboard mostrará los valores
                        configurados aquí en lugar de los datos en tiempo real.
                        Los filtros del dashboard serán ocultados.
                      </p>
                    </div>
                    <Switch
                      checked={form.modoManual}
                      onCheckedChange={(checked) =>
                        updateField("modoManual", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Campos de configuración */}
              <Card
                className={`border-none glass-card transition-all duration-300 ${
                  !form.modoManual ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Valores del Dashboard
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Estos valores se mostrarán en el dashboard cuando el modo
                    manual esté activado.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Montos */}
                    <CampoNumerico
                      label="Total Recaudado"
                      value={form.totalRecaudado}
                      onChange={(v) => updateField("totalRecaudado", v)}
                      icon={<DollarSign className="h-4 w-4 text-primary" />}
                      prefix="Bs."
                      disabled={!form.modoManual}
                    />
                    <CampoNumerico
                      label="Total Pago QR"
                      value={form.totalQR}
                      onChange={(v) => updateField("totalQR", v)}
                      icon={<QrCode className="h-4 w-4 text-blue-500" />}
                      prefix="Bs."
                      disabled={!form.modoManual}
                    />
                    <CampoNumerico
                      label="Total Efectivo"
                      value={form.totalEfectivo}
                      onChange={(v) => updateField("totalEfectivo", v)}
                      icon={<Banknote className="h-4 w-4 text-emerald-500" />}
                      prefix="Bs."
                      disabled={!form.modoManual}
                    />

                    {/* Cantidades */}
                    <CampoNumerico
                      label="Estudiantes"
                      value={form.totalEstudiantes}
                      onChange={(v) => updateField("totalEstudiantes", v)}
                      icon={
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                      }
                      disabled={!form.modoManual}
                    />
                    <CampoNumerico
                      label="Docentes"
                      value={form.totalDocentes}
                      onChange={(v) => updateField("totalDocentes", v)}
                      icon={<BookUser className="h-4 w-4 text-purple-500" />}
                      disabled={!form.modoManual}
                    />
                    <CampoNumerico
                      label="Externos"
                      value={form.totalExternos}
                      onChange={(v) => updateField("totalExternos", v)}
                      icon={
                        <UserRoundCog className="h-4 w-4 text-red-500" />
                      }
                      disabled={!form.modoManual}
                    />
                    <CampoNumerico
                      label="Inscritos"
                      value={form.totalInscritos}
                      onChange={(v) => updateField("totalInscritos", v)}
                      icon={<Users className="h-4 w-4 text-primary" />}
                      disabled={!form.modoManual}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botón Guardar */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  Guardar Configuración
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ─── Pestaña Otros (placeholder) ───────────────────────────── */}
        <TabsContent value="otros">
          <Card className="border-none glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Otras configuraciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Próximamente se agregarán más opciones de configuración.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
