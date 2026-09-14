import { PermissionWrapper } from "@/components/PermissionWrapper";
import { ExternosDatatable } from "./components/ExternosDatatable";

export default function ExternosPage() {
  return (
    <div className="container p-1 mt-8">
      <PermissionWrapper requiredPermission="/admin/externos" act="read">
        <ExternosDatatable />
      </PermissionWrapper>
    </div>
  );
}
