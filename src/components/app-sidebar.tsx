"use client";

import React from "react";
import { FileSpreadsheet } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useAuth } from "@/contexts/AuthProvider";
import { versionNumber } from "@/lib/utilities";
import { NavItem } from "./nav-item";
import Link from "next/link";

const VersionDisplay = () => (
  <div className="text-muted-foreground border-t py-2 text-center text-xs">
    v{versionNumber()}
  </div>
);

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  if (!user) return null;

  const selectedRole = user.roles.find((role) => role.idRol === user.idRol);
  if (!selectedRole) return null;

  const menuStructure: any = selectedRole.modulos.map((modulo) => ({
    section: modulo.label,
    isOpen: true,
    items: modulo.subModulo.map((sub) => ({
      name: sub.label,
      href: sub.url,
      desc: sub.propiedades.descripcion,
      iconName: sub.propiedades.icono,
    })),
  }));

  return (
    <Sidebar collapsible="icon" {...props} className="border-r-0">
      <SidebarHeader className="bg-sidebar/50 backdrop-blur-sm">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="my-4 py-6 hover:bg-transparent active:bg-transparent group">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-tight text-gradient leading-none">APP</span>
                  <span className="text-lg font-black tracking-tighter leading-none">CURSOS</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar/50 backdrop-blur-sm">
        <NavItem data={menuStructure} />
      </SidebarContent>
      <SidebarFooter className="bg-sidebar/50 backdrop-blur-sm border-t border-sidebar-border/50">
        <VersionDisplay />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
