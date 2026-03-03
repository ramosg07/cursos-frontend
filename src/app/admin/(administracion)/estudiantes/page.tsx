import { PermissionWrapper } from "@/components/PermissionWrapper";
import { EstudiantesDatatable } from "./components/EstudiantesDatatable";

export default function EstudiantesPage() {
  return (
    <PermissionWrapper requiredPermission="/admin/estudiantes" act="read">
      <EstudiantesDatatable />
    </PermissionWrapper>
  );
}
