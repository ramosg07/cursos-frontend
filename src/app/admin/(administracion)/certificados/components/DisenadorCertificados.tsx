"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Text,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import useImage from "use-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Save,
  Download,
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Constants } from "@/config/Constants";
import { CertificadoCampo, CertificadoConfig } from "../types";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  initialConfig?: CertificadoConfig;
  fondoUrl?: string;
  onSave: (config: CertificadoConfig) => void;
  onUploadFondo: (file: File) => void;
}

const LETTER_SIZE = {
  HORIZONTAL: { width: 1056, height: 816 },
  VERTICAL: { width: 816, height: 1056 },
};

export function DisenadorCertificados({
  initialConfig,
  fondoUrl,
  onSave,
  onUploadFondo,
}: Props) {
  console.warn({ initialConfig });

  const [config, setConfig] = useState<CertificadoConfig>(
    initialConfig || {
      canvasSize: LETTER_SIZE.HORIZONTAL,
      campos: [
        {
          id: "nombre",
          tipo: "texto",
          valor: "[ESTUDIANTE]",
          variable: "nombre",
          testValue: "JUAN PEREZ PEREZ",
          x: 200,
          y: 400,
          fontSize: 40,
          fontFamily: "Arial",
          fill: "#000000",
          align: "center",
          draggable: true,
          width: 656,
        },
        {
          id: "curso",
          tipo: "texto",
          valor: "[CURSO]",
          variable: "curso",
          testValue: "REACT JS",
          x: 200,
          y: 500,
          fontSize: 30,
          fontFamily: "Arial",
          fill: "#333333",
          align: "center",
          draggable: true,
          width: 656,
        },
      ],
      fondo: false,
    },
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const transformerRef = useRef<any>(null);

  // Sincronización del Transformer con el nodo seleccionado
  useEffect(() => {
    if (transformerRef.current) {
      const stage = transformerRef.current.getStage();
      const selectedNode = stage.findOne("#" + selectedId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);
  const getFullFondoUrl = () => {
    if (!fondoUrl) return "";
    if (fondoUrl.startsWith("http")) return fondoUrl;
    const baseUrl = Constants.baseUrl.replace("/api", "");
    const cleanFondoUrl = fondoUrl.startsWith("/") ? fondoUrl : `/${fondoUrl}`;
    return `${baseUrl}${cleanFondoUrl}`;
  };

  const [fondo] = useImage(getFullFondoUrl(), "anonymous");
  const stageRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnd = (e: any, id: string) => {
    const newCampos = config.campos.map((c) => {
      if (c.id === id) {
        return { ...c, x: e.target.x(), y: e.target.y() };
      }
      return c;
    });
    setConfig({ ...config, campos: newCampos });
  };

  const handleTransformEnd = (e: any, id: string) => {
    const node = e.target;
    const newCampos = config.campos.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
        };
      }
      return c;
    });
    setConfig({ ...config, campos: newCampos });
  };

  const handleTextChange = (
    id: string,
    field: keyof CertificadoCampo,
    value: any,
  ) => {
    const newCampos = config.campos.map((c) => {
      if (c.id === id) {
        return { ...c, [field]: value };
      }
      return c;
    });
    setConfig({ ...config, campos: newCampos });
  };

  const handleSave = () => {
    onSave(config);
  };

  const handleAgregarCampo = () => {
    const nuevoId = `campo_${Date.now()}`;
    const nuevoCampo: CertificadoCampo = {
      id: nuevoId,
      tipo: "texto",
      valor: "[NUEVO TEXTO]",
      variable: "nuevo_campo",
      testValue: "TEXTO DE PRUEBA",
      x: 100,
      y: 100,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#000000",
      align: "left",
      draggable: true,
      width: 300,
    };
    setConfig({
      ...config,
      campos: [...config.campos, nuevoCampo],
    });
    setSelectedId(nuevoId);
  };

  const handleEliminarCampo = (id: string) => {
    setConfig({
      ...config,
      campos: config.campos.filter((c) => c.id !== id),
    });
    setSelectedId(null);
  };

  const handleExportPDF = () => {
    if (!stageRef.current) return;

    // Deseleccionar para no mostrar el Transformer en el PDF
    setSelectedId(null);

    // El Transformer se oculta inmediatamente en el siguiente ciclo de render.
    // Para asegurar que toDataURL lo capture sin el transformer, usamos un pequeño delay
    // o forzamos el render. En Konva, podemos llamar a layer.draw()

    setTimeout(() => {
      const stage = stageRef.current;
      const oldScale = stage.scaleX();

      // Resetear escala visual para captura 1:1
      stage.scale({ x: 1, y: 1 });
      const uri = stage.toDataURL();
      stage.scale({ x: oldScale, y: oldScale }); // Restaurar escala visual (0.6)

      const orientation =
        config.canvasSize.width > config.canvasSize.height ? "l" : "p";
      const pdf = new jsPDF({
        orientation: orientation,
        unit: "px",
        format: [config.canvasSize.width, config.canvasSize.height],
      });

      pdf.addImage(
        uri,
        "PNG",
        0,
        0,
        config.canvasSize.width,
        config.canvasSize.height,
      );
      pdf.save("certificado-diseño.pdf");
      toast.success("PDF generado correctamente");
    }, 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFondo(e.target.files[0]);
    }
  };

  const selectedCampo = config.campos.find((c) => c.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar de herramientas */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="gap-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Lienzo y Fondo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 w-full">
              <Label>Orientación</Label>
              <Select
                value={
                  config.canvasSize.width > config.canvasSize.height
                    ? "HORIZONTAL"
                    : "VERTICAL"
                }
                onValueChange={(val) =>
                  setConfig({
                    ...config,
                    canvasSize:
                      val === "HORIZONTAL"
                        ? LETTER_SIZE.HORIZONTAL
                        : LETTER_SIZE.VERTICAL,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HORIZONTAL">Horizontal (Carta)</SelectItem>
                  <SelectItem value="VERTICAL">Vertical (Carta)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 w-full">
              <Label>Imagen de Fondo</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Subir Fondo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Checkbox
                id={"fondo"}
                checked={config.fondo}
                onCheckedChange={(checked: boolean) => {
                  setConfig({
                    ...config,
                    fondo: checked,
                  });
                }}
              />
              <Label>Fondo</Label>
            </div>
          </CardContent>
        </Card>

        {selectedCampo && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                Propiedades: {selectedCampo.id}
              </CardTitle>
              {/* TODO: Borrar, Si los campos son dinamicos */}
              {/* <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleEliminarCampo(selectedCampo.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button> */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Identificador (Variable)</Label>
                <Input
                  disabled
                  value={selectedCampo.variable || ""}
                  placeholder="ej. firma_director"
                  onChange={(e) =>
                    handleTextChange(selectedId!, "variable", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Valor de Prueba (Vista Previa)</Label>
                <Input
                  value={selectedCampo.testValue || ""}
                  placeholder="Texto para previsualizar"
                  onChange={(e) =>
                    handleTextChange(selectedId!, "testValue", e.target.value)
                  }
                />
              </div>
              {/* <div className="space-y-2">
                <Label>Texto de Etiqueta</Label>
                <Input
                  value={selectedCampo.valor}
                  onChange={(e) =>
                    handleTextChange(selectedId!, "valor", e.target.value)
                  }
                />
              </div> */}
              {/* <div className="space-y-2">
                <Label>Tamaño de Fuente</Label>
                <Input
                  type="number"
                  value={selectedCampo.fontSize}
                  onChange={(e) =>
                    handleTextChange(
                      selectedId!,
                      "fontSize",
                      parseInt(e.target.value)
                    )
                  }
                />
              </div> */}
              {/* <div className="space-y-2">
                <Label>Color de Texto</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-12 p-1 h-10"
                    value={selectedCampo.fill}
                    onChange={(e) =>
                      handleTextChange(selectedId!, "fill", e.target.value)
                    }
                  />
                  <Input
                    type="text"
                    value={selectedCampo.fill}
                    onChange={(e) =>
                      handleTextChange(selectedId!, "fill", e.target.value)
                    }
                  />
                </div>
              </div> */}
              <div className="space-y-2 w-full">
                <Label>Alineación</Label>
                <Select
                  value={selectedCampo.align}
                  onValueChange={(val: any) =>
                    handleTextChange(selectedId!, "align", val)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Izquierda</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="right">Derecha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ancho de Caja (px)</Label>
                <Input
                  type="number"
                  value={selectedCampo.width}
                  onChange={(e) =>
                    handleTextChange(
                      selectedId!,
                      "width",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="gap-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleAgregarCampo}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Texto
            </Button> */}
            <Button
              variant={isPreview ? "default" : "outline"}
              className="w-full justify-start overflow-hidden"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              <span className="truncate">
                {isPreview ? "Salir de Vista Previa" : "Ver con Datos Reales"}
              </span>
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <Button onClick={handleSave} className="w-full" disabled={isPreview}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Plantilla
          </Button>
          <Button
            onClick={handleExportPDF}
            variant="secondary"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF (Muestra)
          </Button>
        </div>
      </div>

      {/* Área del Canvas */}
      <div className="lg:col-span-3 bg-muted/20 rounded-xl border p-4 flex justify-center items-start overflow-auto min-h-[600px]">
        <div
          className="shadow-2xl bg-white"
          style={{
            width: config.canvasSize.width * 0.6, // Escala visual al 60%
            height: config.canvasSize.height * 0.6,
          }}
        >
          <Stage
            width={config.canvasSize.width}
            height={config.canvasSize.height}
            scaleX={0.6}
            scaleY={0.6}
            ref={stageRef}
            onClick={(e) => {
              if (e.target === e.target.getStage()) {
                setSelectedId(null);
              }
            }}
          >
            <Layer>
              {fondo && (
                <KonvaImage
                  image={fondo}
                  width={config.canvasSize.width}
                  height={config.canvasSize.height}
                  key={fondo?.src || "loading"} // Forzar re-render si la imagen cambia
                />
              )}
              {config.campos.map((campo) => {
                const displayValue = isPreview
                  ? campo.testValue || campo.valor
                  : campo.valor;

                return (
                  <Text
                    key={campo.id}
                    id={campo.id}
                    text={displayValue}
                    x={campo.x}
                    y={campo.y}
                    fontSize={campo.fontSize}
                    fontFamily={campo.fontFamily}
                    fill={campo.fill}
                    align={campo.align}
                    width={campo.width}
                    scaleX={campo.scaleX || 1}
                    scaleY={campo.scaleY || 1}
                    wrap="word"
                    draggable={campo.draggable && !isPreview}
                    onClick={() => !isPreview && setSelectedId(campo.id)}
                    onDragStart={() => setSelectedId(campo.id)}
                    onDragEnd={(e) => handleDragEnd(e, campo.id)}
                    onTransformEnd={(e) => handleTransformEnd(e, campo.id)}
                    stroke={
                      selectedId === campo.id && !isPreview
                        ? "#0070f3"
                        : undefined
                    }
                    strokeWidth={selectedId === campo.id && !isPreview ? 1 : 0}
                  />
                );
              })}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limitar tamaño mínimo
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
