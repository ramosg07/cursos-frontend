import { PermissionWrapper } from "@/components/PermissionWrapper";
import { DocentesDatatable } from "./components/DocentesDatatable";

export default function DocentesPage() {
  return (
    <div className="container p-1 mt-8">
      <PermissionWrapper requiredPermission="/admin/docentes" act="read">
        <DocentesDatatable />
      </PermissionWrapper>
    </div>
  );
}
