import { PermissionWrapper } from "@/components/PermissionWrapper";
import { AulasDatatable } from "./components/AulasDatatable";

export default function ProductosPage() {
  return (
    <div className="container p-1 mt-8">
      <PermissionWrapper requiredPermission="/admin/aulas" act={"read"}>
        <AulasDatatable />
      </PermissionWrapper>
    </div>
  );
}
