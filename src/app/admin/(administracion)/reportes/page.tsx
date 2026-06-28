import { PermissionWrapper } from "@/components/PermissionWrapper";
import { ReportesDatatable } from "./components/ReportesDatatable";

export default function ReportesPage() {
    return (
      <div className="container p-1 mt-8">
        <PermissionWrapper requiredPermission="/admin/reportes" act="read">
          <ReportesDatatable />
        </PermissionWrapper>
      </div>
    );
  }
  