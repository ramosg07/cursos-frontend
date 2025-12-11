import { AppSidebar } from "@/components/app-sidebar";
import HeaderAdmin from "@/components/HeaderAdmin";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar variant="floating" />
      <SidebarInset>
        <HeaderAdmin />
        <div className="flex overflow-hidden">
          <div
            id="main-content"
            className={cn(
              "relative h-full w-full overflow-y-auto transition-all duration-300"
            )}
          >
            <main>
              <div className="px-4 pt-6 pb-6 lg:px-6">
                <div className="min-h-[calc(100vh-100px)] w-full">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
