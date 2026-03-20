import { PermissionWrapper } from "@/components/PermissionWrapper";
import { EstudiantesDatatable } from "./components/EstudiantesDatatable";

export default function EstudiantesPage() {
  return (
    <div className="container p-1 mt-8">
      <PermissionWrapper requiredPermission="/admin/estudiantes" act="read">
        <EstudiantesDatatable />
      </PermissionWrapper>
    </div>
  );
}
