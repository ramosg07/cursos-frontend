"use client";

import { useAuth } from "@/contexts/AuthProvider";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { print } from "@/lib/print";

interface PermissionWrapperProps {
  children: React.ReactNode;
  requiredPermission: string;
  act: string;
}

export const PermissionWrapper = ({
  children,
  requiredPermission,
  act,
}: PermissionWrapperProps) => {
  const { checkPermission } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    const verifyPermission = async () => {
      try {
        const permission = await checkPermission(requiredPermission, act);
        setHasPermission(permission);
      } catch (error) {
        print("Error al verificar permiso: ", error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };
    verifyPermission();
  }, [checkPermission, requiredPermission, act]);

  useEffect(() => {
    if (!isLoading && !hasPermission) notFound();
  }, [isLoading, hasPermission, router]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!hasPermission) {
    // router.push("/404"); TODO: implementar ruta 404
    return null;
  }

  return <>{children}</>;
};
