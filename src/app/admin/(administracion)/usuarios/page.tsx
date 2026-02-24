import { siteName } from "@/lib/utilities";
import { Metadata } from "next";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { UsuariosDatatable02 } from "./components/UsuariosDatatable02";

export const metadata: Metadata = {
  title: `Usuarios - ${siteName()}`,
};

export default function UsuariosPage() {
  return (
    <div className="container p-1">
      <PermissionWrapper requiredPermission="/admin/usuarios" act={"read"}>
        <UsuariosDatatable02 />
      </PermissionWrapper>
    </div>
  );
}
