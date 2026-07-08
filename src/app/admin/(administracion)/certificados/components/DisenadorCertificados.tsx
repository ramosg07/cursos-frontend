"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Text,
  Image as KonvaImage,
  Transformer,
  Rect,
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
import { Textarea } from "@/components/ui/textarea";

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

const CAMPOS_VARIABLES = [
  {
    id: "nombre",
    label: "Nombre Completo (Inscrito)",
    testValue: "JUAN PEREZ PEREZ",
  },
  { id: "nombres", label: "Nombres (Inscrito)", testValue: "JUAN" },
  { id: "apellidos", label: "Apellidos (Inscrito)", testValue: "PEREZ PEREZ" },
  { id: "ci", label: "Nro. Documento", testValue: "1234567 LP" },
  { id: "matricula", label: "Matrícula/Código", testValue: "2024-001" },
  { id: "curso", label: "Nombre del Curso", testValue: "DESARROLLO WEB" },
  { id: "paralelo", label: "Paralelo", testValue: "PARALELO A" },
  { id: "monto", label: "Monto Pagado", testValue: "500.00" },
  {
    id: "fecha_inscripcion",
    label: "Fecha de Inscripción",
    testValue: "01/01/2026",
  },
  { id: "fecha", label: "Fecha Actual", testValue: "25/05/2026" },
  {
    id: "codigo_certificado",
    label: "Código de Certificado",
    testValue: "CERT-ABC123XYZ",
  },
];

export function DisenadorCertificados({
  initialConfig,
  fondoUrl,
  onSave,
  onUploadFondo,
}: Props) {
  const [config, setConfig] = useState<CertificadoConfig>(
    initialConfig || {
      canvasSize: LETTER_SIZE.HORIZONTAL,
      campos: [],
      fondo: false,
    },
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [zoom, setZoom] = useState(0.6);
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

    const apiUrl = new URL(Constants.baseUrl);
    const url = `${apiUrl.origin}${fondoUrl.startsWith("/") ? fondoUrl : `/${fondoUrl}`}`;
    console.warn({ apiUrl, url });
    return url;
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
    setConfig((prev) => ({
      ...prev,
      campos: prev.campos.map((c) =>
        c.id === id ? { ...c, [field]: value } : c,
      ),
    }));
  };

  const handleMultipleFieldsChange = (
    id: string,
    changes: Partial<CertificadoCampo>,
  ) => {
    setConfig((prev) => ({
      ...prev,
      campos: prev.campos.map((c) => (c.id === id ? { ...c, ...changes } : c)),
    }));
  };

  const handleSave = () => {
    onSave(config);
  };

  const handleAgregarCampo = () => {
    const nuevoId = `campo_${Date.now()}`;
    const nuevoCampo: CertificadoCampo = {
      id: nuevoId,
      tipo: "texto",
      valor: "NUEVO TEXTO",
      variable: "",
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

  const handleAgregarQR = () => {
    const nuevoId = `qr_${Date.now()}`;
    const nuevoCampo: CertificadoCampo = {
      id: nuevoId,
      tipo: "qr",
      valor: "QR_VERIFICACIÓN",
      variable: "",
      testValue: "",
      x: 100,
      y: 100,
      fontSize: 12,
      fontFamily: "Arial",
      fill: "#000000",
      align: "center",
      draggable: true,
      width: 120,
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
    <div className="flex flex-col gap-4">
      <Card className="gap-2 py-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Lienzo y Fondo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-6 space-y-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 space-y-2 col-span-3">
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
                  className="w-full p-0"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-2 w-2 mr-2" />
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
            <div className="space-y-2 w-full flex items-center align-center gap-2">
              <Checkbox
                className="m-0 p-0"
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
          </div>
          <div className="space-y-2 w-full col-span-1">
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={isPreview}
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Plantilla
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF (Muestra)
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de herramientas */}
        <div className="lg:col-span-1 space-y-6">
          {selectedCampo && (
            <Card className="py-6 ">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-primary">
                  PROPIEDADES: {selectedCampo.id}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleEliminarCampo(selectedCampo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {selectedCampo.tipo !== "qr" && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider pb-1">
                      Contenido del Campo
                    </Label>
                    <div className="space-y-2 pt-2 pb-2 w-full">
                      <Label>Tipo de Texto</Label>
                      <Select
                        value={selectedCampo.variable ? "variable" : "estatico"}
                        onValueChange={(val) => {
                          if (val === "estatico") {
                            handleTextChange(selectedId!, "variable", "");
                          } else {
                            const firstVar = CAMPOS_VARIABLES[0];
                            handleMultipleFieldsChange(selectedId!, {
                              variable: firstVar.id,
                              valor: `[${firstVar.label.toUpperCase()}]`,
                              testValue: firstVar.testValue,
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          <SelectItem value="estatico">
                            Texto Estático
                          </SelectItem>
                          <SelectItem value="variable">
                            Variable del Sistema
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedCampo.variable ? (
                      <div className="space-y-2 w-full">
                        <Label>Variable del Sistema</Label>
                        <Select
                          value={selectedCampo.variable}
                          onValueChange={(val) => {
                            const v = CAMPOS_VARIABLES.find(
                              (x) => x.id === val,
                            );
                            if (v) {
                              handleMultipleFieldsChange(selectedId!, {
                                variable: v.id,
                                valor: `[${v.label.toUpperCase()}]`,
                                testValue: v.testValue,
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            {CAMPOS_VARIABLES.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                {v.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[10px] text-muted-foreground italic">
                          Esta variable se reemplazará automáticamente al
                          generar el certificado.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>Texto Estático</Label>
                        <Textarea
                          className="min-h-[120px]"
                          value={selectedCampo.valor}
                          onChange={(e) =>
                            handleTextChange(
                              selectedId!,
                              "valor",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-4 pt-4">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Estilo y Formato
                  </Label>
                  {selectedCampo.tipo !== "qr" && (
                    <>
                      <div className="space-y-2">
                        <Label>Tamaño de Fuente</Label>
                        <Input
                          type="number"
                          value={selectedCampo.fontSize}
                          onChange={(e) =>
                            handleTextChange(
                              selectedId!,
                              "fontSize",
                              parseInt(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Color de Texto</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            className="w-12 p-1 h-10"
                            value={selectedCampo.fill}
                            onChange={(e) =>
                              handleTextChange(
                                selectedId!,
                                "fill",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            type="text"
                            value={selectedCampo.fill}
                            onChange={(e) =>
                              handleTextChange(
                                selectedId!,
                                "fill",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
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
                    </>
                  )}
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
                  {selectedCampo.tipo !== "qr" && (
                    <>
                      <div className="space-y-2">
                        <Label>Valor de Prueba (Vista Previa)</Label>
                        <Input
                          value={selectedCampo.testValue || ""}
                          placeholder="Texto para previsualizar"
                          onChange={(e) =>
                            handleTextChange(
                              selectedId!,
                              "testValue",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="gap-2 py-6">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Acciones de Diseño
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleAgregarCampo}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Texto
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleAgregarQR}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Código QR
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Área del Canvas */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          {/* Controles de Zoom */}
          <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
            >
              -
            </Button>
            <span className="text-xs font-medium w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            >
              +
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(0.6)}
              className="text-xs"
            >
              Reset
            </Button>
          </div>

          <div className="bg-muted/20 rounded-xl border p-4 flex justify-center items-start overflow-auto min-h-[600px]">
            <div
              className="shadow-2xl bg-white"
              style={{
                width: config.canvasSize.width * zoom,
                height: config.canvasSize.height * zoom,
              }}
            >
              <Stage
                width={config.canvasSize.width}
                height={config.canvasSize.height}
                scaleX={zoom}
                scaleY={zoom}
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
                    if (campo.tipo === "qr") {
                      const size = campo.width || 120;
                      return (
                        <React.Fragment key={campo.id}>
                          <Rect
                            id={campo.id}
                            x={campo.x}
                            y={campo.y}
                            width={size}
                            height={size}
                            fill="#f3f4f6"
                            stroke={
                              selectedId === campo.id && !isPreview
                                ? "#0070f3"
                                : "#374151"
                            }
                            strokeWidth={
                              selectedId === campo.id && !isPreview ? 2 : 1
                            }
                            dash={
                              selectedId === campo.id && !isPreview
                                ? undefined
                                : [4, 4]
                            }
                            scaleX={campo.scaleX || 1}
                            scaleY={campo.scaleY || 1}
                            draggable={campo.draggable && !isPreview}
                            onClick={() =>
                              !isPreview && setSelectedId(campo.id)
                            }
                            onDragStart={() => setSelectedId(campo.id)}
                            onDragEnd={(e) => handleDragEnd(e, campo.id)}
                            onTransformEnd={(e) =>
                              handleTransformEnd(e, campo.id)
                            }
                          />
                          <Text
                            text="[ QR VERIFICACIÓN ]"
                            x={campo.x}
                            y={campo.y + size / 2 - 6}
                            width={size}
                            scaleX={campo.scaleX || 1}
                            scaleY={campo.scaleY || 1}
                            align="center"
                            fontSize={10}
                            fontFamily="monospace"
                            fill="#374151"
                            listening={false}
                          />
                        </React.Fragment>
                      );
                    }

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
                        strokeWidth={
                          selectedId === campo.id && !isPreview ? 1 : 0
                        }
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
      </div>
    </div>
  );
}
