"use client";

import { AppSidebar } from "@/components/app-sidebar";
import HeaderAdmin from "@/components/HeaderAdmin";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthProvider";
import { useLoading } from "@/contexts/LoadingProvider";
import { cn } from "@/lib/utils";
import { ReactNode, useEffect } from "react";
import { print } from "@/lib/print";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAuthLoading } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    if (isAuthLoading) {
      showLoading("Cargando panel de administración...");
    } else {
      hideLoading();
    }

    print(`layout admin: isAuthLoading=${isAuthLoading}, user=${!!user}`);

    return () => {
      hideLoading();
    };
  }, [isAuthLoading, user, showLoading, hideLoading]);

  if (isAuthLoading || !user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="floating" />
      <SidebarInset className="min-w-0 overflow-hidden">
        <HeaderAdmin />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="px-4 pt-6 pb-6 lg:px-6">
              <div className="min-h-[calc(100vh-100px)] w-full">{children}</div>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
