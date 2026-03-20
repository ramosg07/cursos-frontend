import { siteName } from "@/lib/utilities";
import { Metadata } from "next";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { CursosDatatable } from "./components/CursosDatatable";

export const metadata: Metadata = {
  title: `Cursos - ${siteName()}`,
};

export default function CursosPage() {
  return (
    <div className="container p-1 mt-8">
      <PermissionWrapper requiredPermission="/admin/cursos" act={"read"}>
        <CursosDatatable />
      </PermissionWrapper>
    </div>
  );
}
