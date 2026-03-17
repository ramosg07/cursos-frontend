"use client";
import { useState } from "react";
import { LogoutDialog } from "./HeaderAdmin/LogoutDialog";
import { ThemeSwitcher } from "./theme-switcher";
import { useAuth } from "@/contexts/AuthProvider";
import UserMenu from "./HeaderAdmin/UserMenu";
import { Tooltip, TooltipContent, TooltipProvider } from "./ui/tooltip";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { print } from "@/lib/print";

const HeaderAdmin = () => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { logout, user, changeRole } = useAuth();

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const inicializaDatos = () => {
    if (user && user.persona) {
      const { nombres, primerApellido, segundoApellido } = user.persona;
      const inicialNombre = nombres ? nombres[0] : "";
      const inicialPrimerApellido = primerApellido
        ? primerApellido[0]
        : undefined;
      const inicialSegundoApellido = segundoApellido
        ? segundoApellido[0]
        : undefined;
      const inicialApellidos =
        inicialPrimerApellido ?? inicialSegundoApellido ?? "";
      return `${inicialNombre}${inicialApellidos}`;
    }
    return "";
  };

  const handleRoleChange = async (idRol: string) => {
    try {
      await changeRole(idRol);
    } catch (error) {
      print("Error changing role:", error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass border-b border-white/10 shadow-sm transition-all duration-300">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1 h-9 w-9 rounded-lg hover:bg-accent transition-colors" />
                  <Separator
                    orientation="vertical"
                    className="mx-2 h-6 bg-border/50"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-muted-foreground">Panel de Control</p>
                  </div>
                </div>
                <TooltipContent>Toggle Sidebar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeSwitcher />
            <Separator orientation="vertical" className="h-6 bg-border/50" />
            <UserMenu
              user={user}
              handleRoleChange={handleRoleChange}
              handleLogout={handleLogout}
              getInitials={inicializaDatos}
            />
          </div>
        </div>
      </header>
      <LogoutDialog
        showLogoutDialog={showLogoutDialog}
        setShowLogoutDialog={setShowLogoutDialog}
        confirmLogout={confirmLogout}
      />
    </>
  );
};

export default HeaderAdmin;
