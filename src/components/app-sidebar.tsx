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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="my-3 py-3">
              <Link href="/">
                <FileSpreadsheet className="h-5 w-5" />
                <span className="text-base font-semibold">APP CURSOS</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavItem data={menuStructure} />
      </SidebarContent>
      <SidebarFooter>
        <VersionDisplay />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
