"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Camera,
  CameraOff,
  Loader2,
  AlertTriangle,
  QrCode,
  HelpCircle,
} from "lucide-react";

export default function LectorQRPage() {
  const { user, isAuthLoading } = useAuth();
  const router = useRouter();
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null,
  );
  const [scanning, setScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef<any>(null);

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login?next=/admin/certificados/lector");
    }
  }, [user, isAuthLoading, router]);

  // Limpiar scanner al desmontar componente
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async (cameraIdToUse?: string) => {
    setIsInitializing(true);
    setCameraPermission(null);

    try {
      // Importar dinámicamente en el cliente
      const { Html5Qrcode } = await import("html5-qrcode");

      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);

      if (devices && devices.length > 0) {
        setCameraPermission(true);
        const defaultCamera = cameraIdToUse || devices[devices.length - 1].id; // Usualmente la trasera
        setSelectedCameraId(defaultCamera);

        // Si ya hay una instancia corriendo, detenerla
        if (scannerRef.current) {
          try {
            await scannerRef.current.stop();
          } catch (e) {}
        }

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          defaultCamera,
          {
            fps: 15,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.7;
              return { width: size, height: size };
            },
          },
          (decodedText) => {
            // Éxito: extraemos el código del certificado
            const match = decodedText.match(/CERT-[A-Za-z0-9]+/);
            if (match && match[0]) {
              toast.success("Código de certificado detectado con éxito!");
              stopScanner();
              router.push(`/admin/certificados/verificar?codigo=${match[0]}`);
            } else {
              toast.warning(
                "QR escaneado con éxito, pero no contiene un formato de certificado oficial.",
              );
            }
          },
          (errorMessage) => {
            // Silencioso - escaneando...
          },
        );
        setScanning(true);
      } else {
        setCameraPermission(false);
        toast.error("No se encontraron cámaras de video en este dispositivo.");
      }
    } catch (err: any) {
      console.error(err);
      setCameraPermission(false);
      toast.error("Permiso de cámara denegado o no disponible.");
    } finally {
      setIsInitializing(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error deteniendo el scanner:", err);
      }
    }
    setScanning(false);
  };

  const handleCameraChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const id = e.target.value;
    setSelectedCameraId(id);
    if (scanning) {
      await stopScanner();
      startScanner(id);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse text-sm">
          Cargando lector...
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Botón Volver */}
      {/* <Button
        variant="ghost"
        onClick={() => router.push("/admin/certificados")}
        className="gap-2 hover:bg-muted/50"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Certificados
      </Button> */}

      <Card className="overflow-hidden border-border bg-card/60 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center py-4">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <QrCode className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-black text-gradient">
            Lector de Certificados QR
          </CardTitle>
          <CardDescription className="text-xs max-w-[280px] mx-auto">
            Utiliza la cámara trasera de tu móvil para verificar la validez e
            inactivar acreditaciones oficiales
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 flex flex-col items-center justify-center">
          {/* Zona de Cámara */}
          <div className="relative w-full aspect-square max-w-[320px] rounded-2xl border border-border overflow-hidden shadow-inner flex items-center justify-center">
            {/* Elemento de renderizado para html5-qrcode */}
            <div
              id="reader"
              className="absolute inset-0 w-full h-full object-cover [&_video]:object-cover"
            />

            {/* Efectos de escaneo visuales */}
            {scanning && (
              <>
                {/* Cuadro de escaneo */}
                <div className="absolute z-10 w-[70%] h-[70%] border-2 border-dashed border-emerald-500 rounded-lg pointer-events-none" />

                {/* Línea Láser Animada */}
                <div className="absolute z-10 w-[70%] h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-laser shadow-[0_0_8px_rgba(52,211,153,0.8)] pointer-events-none" />

                {/* Pulsar en las esquinas */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />
              </>
            )}

            {/* Estado Inicial o Error */}
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
                {isInitializing ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground font-medium">
                      Iniciando cámara y cargando librerías...
                    </p>
                  </>
                ) : cameraPermission === false ? (
                  <>
                    <AlertTriangle className="h-12 w-12 text-destructive animate-bounce" />
                    <p className="text-sm font-semibold text-destructive">
                      Permiso de Cámara Denegado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Por favor, autoriza el acceso a la cámara en la
                      configuración de tu navegador.
                    </p>
                  </>
                ) : (
                  <>
                    <Camera className="h-12 w-12 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {
                        'La cámara está apagada. Haz clic en "Iniciar Escáner" para activar el lector.'
                      }
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Selector de Dispositivo de Cámara */}
          {cameras.length > 1 && (
            <div className="w-full max-w-[320px] space-y-1.5 animate-fade-in">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Seleccionar Cámara
              </label>
              <select
                value={selectedCameraId}
                onChange={handleCameraChange}
                className="w-full bg-background border border-border text-sm rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Cámara ${camera.id.substring(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botones de Control */}
          <div className="w-full max-w-[320px] flex gap-3">
            {scanning ? (
              <Button
                variant="destructive"
                className="w-full py-6 font-bold shadow-lg shadow-destructive/20 gap-2 rounded-xl transition-all duration-300"
                onClick={stopScanner}
              >
                <CameraOff className="h-5 w-5" />
                Apagar Escáner
              </Button>
            ) : (
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 font-bold shadow-lg shadow-emerald-500/20 gap-2 rounded-xl transition-all duration-300"
                onClick={() => startScanner(selectedCameraId)}
                disabled={isInitializing}
              >
                {isInitializing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
                Iniciar Escáner
              </Button>
            )}
          </div>
        </CardContent>

        {/* Instrucciones Rápidas */}
        <CardFooter className="bg-muted/30 border-t border-border/50 p-6 flex flex-col items-start gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <HelpCircle className="h-4 w-4 text-primary" /> Guía de Validación
            Rápida
          </div>
          <div className="space-y-3 w-full text-xs text-muted-foreground">
            <div className="flex gap-2.5 items-start">
              <span className="flex items-center justify-center bg-primary/10 text-primary font-bold rounded-full w-5 h-5 shrink-0 text-[10px]">
                1
              </span>
              <p>
                Inicia el escáner y apunta directamente al código QR del
                certificado físico o PDF.
              </p>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="flex items-center justify-center bg-primary/10 text-primary font-bold rounded-full w-5 h-5 shrink-0 text-[10px]">
                2
              </span>
              <p>
                El lector procesará y extraerá el código único de seguridad (
                <code className="font-mono text-primary font-semibold">
                  CERT-...
                </code>
                ).
              </p>
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="flex items-center justify-center bg-primary/10 text-primary font-bold rounded-full w-5 h-5 shrink-0 text-[10px]">
                3
              </span>
              <p>
                Serás redirigido al panel privado para confirmar los datos y
                marcar el documento como usado.
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
