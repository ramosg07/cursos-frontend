import { PermissionWrapper } from "@/components/PermissionWrapper";
import { Sorteo } from "./components/Sorteo";

export default function SorteoPage() {
  return (
    <div className="container p-1 mt-8">
      <PermissionWrapper requiredPermission="/admin/sorteo" act="read">
        <Sorteo />
      </PermissionWrapper>
    </div>
  );
}
