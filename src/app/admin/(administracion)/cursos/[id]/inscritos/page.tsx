"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { InscritosDatatable } from "./components/InscritosDatatable";
import { Curso } from "../../types";
import { Loader2 } from "lucide-react";
import { PermissionWrapper } from "@/components/PermissionWrapper";

export default function InscritosPage() {
  const params = useParams();
  const id = params.id as string;
  const { sessionRequest } = useAuth();

  const { data: curso, isLoading } = useQuery({
    queryKey: ["curso", id],
    queryFn: async () => {
      const response = await sessionRequest<{
        finalizado: boolean;
        datos: Curso;
      }>({
        url: `/cursos/${id}`,
        method: "get",
      });
      return response?.data.datos;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-2 text-center">
        <h2 className="text-xl font-semibold">Curso no encontrado</h2>
        <p className="text-muted-foreground">
          No se pudo encontrar la información del curso solicitado.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <PermissionWrapper requiredPermission="/admin/cursos/*/inscritos" act={"read"}>
        <InscritosDatatable curso={curso} />
      </PermissionWrapper>
    </div>
  );
}
