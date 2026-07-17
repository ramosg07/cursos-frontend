import { PermissionWrapper } from "@/components/PermissionWrapper";
import { ExamenesDatatable } from "./components/ExamenesDatatable";

export default function ProductosPage() {
  return (
    <div className="container p-1 mt-8">
      <PermissionWrapper requiredPermission="/admin/aulas" act={"read"}>
        <ExamenesDatatable />
      </PermissionWrapper>
    </div>
  );
}
