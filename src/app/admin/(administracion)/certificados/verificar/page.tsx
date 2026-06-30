"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Calendar,
  User,
  BookOpen,
  DollarSign,
  Award,
  Lock,
} from "lucide-react";

interface CertificadoInfo {
  valido: boolean;
  codigoCertificado: string;
  estudiante: string;
  ci: string;
  codigoPersonal: string;
  curso: string;
  paralelo: string;
  fechaInscripcion: string;
  montoPagado: number;
  certificadoUsado: boolean;
}

function VerificarCertificadoContent() {
  const { user, isAuthLoading, sessionRequest } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const codigo = searchParams.get("codigo") || "";

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [certificado, setCertificado] = useState<CertificadoInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!isAuthLoading && !user) {
      const nextPath = encodeURIComponent(
        `/admin/certificados/verificar?codigo=${codigo}`,
      );
      router.replace(`/login?next=${nextPath}`);
    }
  }, [user, isAuthLoading, router, codigo]);

  // Cargar datos del certificado
  useEffect(() => {
    if (!user || !codigo) return;

    const fetchCertificado = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await sessionRequest<any>({
          url: `/certificados/verificar/${codigo}`,
          method: "GET",
        });

        if (res && res.data.datos) {
          setCertificado(res.data.datos);
        } else {
          setError("No se pudo obtener la información del certificado.");
        }
      } catch (err: any) {
        setError(
          err?.mensaje ||
            "Código de certificado no válido o inexistente. Posible falsificación.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCertificado();
  }, [user, codigo, sessionRequest]);

  const handleToggleEstado = async (usado: boolean) => {
    if (!certificado) return;

    setUpdating(true);
    try {
      const res = await sessionRequest<any>({
        url: "/certificados/cambiar-estado-uso",
        method: "POST",
        data: {
          codigoCertificado: certificado.codigoCertificado,
          usado,
        },
      });

      if (res && res.data.datos) {
        setCertificado({
          ...certificado,
          certificadoUsado: usado,
        });
        toast.success(
          usado
            ? "Certificado marcado como USADO correctamente."
            : "Certificado restaurado a NO USADO correctamente.",
        );
      }
    } catch (err: any) {
      toast.error(
        err?.mensaje || "Error al actualizar el estado del certificado.",
      );
    } finally {
      setUpdating(false);
    }
  };

  if (isAuthLoading || !user || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse text-sm font-medium">
          Verificando autenticidad en los servidores seguros...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-lg mx-auto py-12 px-4">
        <Card className="border-destructive/40 shadow-2xl bg-destructive/5 overflow-hidden animate-shake">
          <div className="h-2 bg-destructive" />
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">
              ¡Alerta de Seguridad!
            </CardTitle>
            <CardDescription className="text-destructive/80 font-medium">
              Certificado No Válido o Falsificado
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              El código de verificación proporcionado no coincide con ningún
              certificado emitido en nuestro sistema.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs font-mono text-destructive break-all">
              Código: {codigo || "Ninguno"}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-destructive/10 bg-destructive/5 py-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/certificados")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Volver al panel
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!certificado) return null;

  return (
    <div className="container max-w-xl mx-auto py-8 px-4">
      {/* Botón de retroceso */}
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/certificados")}
        className="mb-6 gap-2 hover:bg-muted/50"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Certificados
      </Button>

      {/* Main Glassmorphic Card */}
      <Card className="overflow-hidden shadow-2xl border-border bg-card/60 backdrop-blur-md transition-all duration-300">
        <div
          className={`h-2 transition-all duration-500 ${certificado.certificadoUsado ? "bg-amber-500" : "bg-emerald-500"}`}
        />

        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-center mb-4">
            <Badge
              variant="outline"
              className="font-mono text-xs border-muted-foreground/30 px-2 py-0.5"
            >
              ID: {certificado.codigoCertificado}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Securizado
            </div>
          </div>

          {/* Status Badge with Micro-animations */}
          <div className="mx-auto mb-4">
            {certificado.certificadoUsado ? (
              <div className="flex flex-col items-center space-y-2 animate-fade-in">
                <div className="bg-amber-500/10 p-3 rounded-full border border-amber-500/20">
                  <XCircle className="h-10 w-10 text-amber-500" />
                </div>
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold tracking-wider px-3 py-1 text-sm rounded-full shadow-lg shadow-amber-500/20">
                  CERTIFICADO YA UTILIZADO
                </Badge>
                <p className="text-xs text-amber-600 font-medium max-w-[280px]">
                  Este certificado ya fue registrado y validado previamente en
                  el sistema.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 animate-fade-in">
                <div className="bg-emerald-500/10 p-3 rounded-full border border-emerald-500/20 animate-pulse">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold tracking-wider px-3 py-1 text-sm rounded-full shadow-lg shadow-emerald-500/20">
                  CERTIFICADO AUTÉNTICO & VÁLIDO
                </Badge>
                <p className="text-xs text-emerald-600 font-medium max-w-[280px]">
                  El documento es legítimo y está disponible para ser utilizado.
                </p>
              </div>
            )}
          </div>

          <CardTitle className="text-xl font-bold tracking-tight mt-2 text-foreground">
            Verificación de Autenticidad
          </CardTitle>
          <CardDescription className="text-xs">
            Servicio de validación y control de acreditaciones académicas
          </CardDescription>
        </CardHeader>

        {/* Certificate Details List */}
        <CardContent className="space-y-4 pb-6 px-6">
          <div className="bg-muted/30 border border-muted/50 rounded-xl p-4 space-y-3.5">
            {/* Student */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Estudiante
                </p>
                <p className="text-sm font-bold text-foreground truncate">
                  {certificado.estudiante}
                </p>
                <p className="text-xs text-muted-foreground">
                  CI: {certificado.ci} | Código: {certificado.codigoPersonal}
                </p>
              </div>
            </div>

            {/* Course */}
            <div className="flex items-start gap-3 border-t border-muted/50 pt-3">
              <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Curso / Paralelo
                </p>
                <p className="text-sm font-bold text-foreground truncate">
                  {certificado.curso}
                </p>
                <p className="text-xs text-muted-foreground">
                  {certificado.paralelo}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3 border-t border-muted/50 pt-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Fecha de Inscripción
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {new Date(certificado.fechaInscripcion).toLocaleDateString(
                    "es-ES",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-start gap-3 border-t border-muted/50 pt-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                  Monto Abonado
                </p>
                <p className="text-sm font-bold text-foreground">
                  Bs. {certificado.montoPagado}
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Teacher Action Section */}
        <CardFooter className="flex flex-col gap-3 bg-muted/20 border-t border-border p-6 rounded-b-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground w-full mb-1">
            <Lock className="h-3.5 w-3.5 text-primary" /> Panel del Docente
            Acreditado
          </div>

          {certificado.certificadoUsado ? (
            <Button
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-5 rounded-lg shadow-md transition-all duration-300 gap-2"
              onClick={() => handleToggleEstado(false)}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Award className="h-5 w-5" />
              )}
              {'Restaurar Certificado a "No Usado"'}
            </Button>
          ) : (
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-5 rounded-lg shadow-lg shadow-amber-500/20 transition-all duration-300 gap-2"
              onClick={() => handleToggleEstado(true)}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {'Marcar Certificado como "Ya Usado"'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerificarCertificadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">
            Cargando módulo de verificación...
          </p>
        </div>
      }
    >
      <VerificarCertificadoContent />
    </Suspense>
  );
}
