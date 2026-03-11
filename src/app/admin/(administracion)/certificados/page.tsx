"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { useState } from "react";
import { CertificadosDatatable } from "./components/CertificadosDatatable";
import { DisenadorCertificados } from "./components/DisenadorCertificados";
import { PlantillaCertificado, CertificadoConfig } from "./types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CertificadosPage() {
  const { sessionRequest } = useAuth();
  const [view, setView] = useState<"list" | "editor">("list");
  const [selectedPlantilla, setSelectedPlantilla] =
    useState<PlantillaCertificado | null>(null);
  const [nombreTmp, setNombreTmp] = useState("");

  const handleAdd = () => {
    setSelectedPlantilla(null);
    setNombreTmp("");
    setView("editor");
  };

  const handleEdit = (plantilla: PlantillaCertificado) => {
    setSelectedPlantilla(plantilla);
    setNombreTmp(plantilla.nombre);
    setView("editor");
  };

  const handleSave = async (config: CertificadoConfig) => {
    if (!nombreTmp.trim()) {
      toast.error("El nombre de la plantilla es obligatorio");
      return;
    }

    try {
      if (selectedPlantilla) {
        // Actualizar
        await sessionRequest({
          url: `/plantillas-certificados/${selectedPlantilla.id}`,
          method: "PATCH",
          data: {
            nombre: nombreTmp,
            configuracion: config,
            orientacion:
              config.canvasSize.width > config.canvasSize.height
                ? "HORIZONTAL"
                : "VERTICAL",
          },
        });
        toast.success("Plantilla actualizada correctamente");
      } else {
        // Crear
        const res = await sessionRequest<any>({
          url: "/plantillas-certificados",
          method: "POST",
          data: {
            nombre: nombreTmp,
            configuracion: config,
            orientacion:
              config.canvasSize.width > config.canvasSize.height
                ? "HORIZONTAL"
                : "VERTICAL",
          },
        });
        if (res && res.data.datos) {
          setSelectedPlantilla(res.data.datos);
          toast.success("Plantilla creada correctamente");
        }
      }
      setView("list");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.mensaje || "Error al guardar plantilla",
      );
    }
  };

  const handleUploadFondo = async (file: File) => {
    if (!selectedPlantilla) {
      toast.warning(
        "Primero guarda la plantilla con un nombre para subir el fondo",
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await sessionRequest({
        url: `/plantillas-certificados/${selectedPlantilla.id}/fondo`,
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Fondo actualizado correctamente");
      // Refrescar datos para ver el fondo
      const res = await sessionRequest<any>({
        url: `/plantillas-certificados/${selectedPlantilla.id}`,
        method: "GET",
      });
      if (res) setSelectedPlantilla(res.data.datos);
    } catch {
      toast.error("Error al subir fondo");
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {view === "editor" && (
            <Button variant="ghost" size="icon" onClick={() => setView("list")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Diseño de Certificados
            </h1>
            <p className="text-muted-foreground">
              {view === "list"
                ? "Gestiona las plantillas de certificados"
                : "Edita tu diseño personalizado"}
            </p>
          </div>
        </div>
      </div>

      {view === "list" ? (
        <CertificadosDatatable onEdit={handleEdit} onAdd={handleAdd} />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-end bg-card p-6 rounded-xl border">
            <div className="flex-1 space-y-2">
              <Label>Nombre de la Plantilla</Label>
              <Input
                value={nombreTmp}
                onChange={(e) => setNombreTmp(e.target.value)}
                placeholder="Ej. Certificado de Aprobación 2024"
              />
            </div>
            <div className="text-sm text-muted-foreground italic pb-2">
              ID: {selectedPlantilla?.id || "Nueva"}
            </div>
          </div>

          <DisenadorCertificados
            key={selectedPlantilla?.id || "nueva"}
            initialConfig={selectedPlantilla?.configuracion}
            fondoUrl={selectedPlantilla?.fondoUrl}
            onSave={handleSave}
            onUploadFondo={handleUploadFondo}
          />
        </div>
      )}
    </div>
  );
}
