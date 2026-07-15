import React from "react";
import { ReportesDatatable } from "./components/ReportesDatatable";
import { PermissionWrapper } from "@/components/PermissionWrapper";

export default function ReportesPage() {
  return (
    <div className="container p-1 mt-8">
      <PermissionWrapper
        requiredPermission="/admin/reportes-prefas"
        act={"read"}
      >
        <ReportesDatatable />
      </PermissionWrapper>
    </div>
  );
}
