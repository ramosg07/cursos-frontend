import React from "react";
import { ProductosDatatable } from "./components/ProductosDatatable";
import { PermissionWrapper } from "@/components/PermissionWrapper";

export default function ProductosPage() {
  return (
    <div className="container p-1 mt-8">
      <PermissionWrapper requiredPermission="/admin/productos" act={"read"}>
        <ProductosDatatable />
      </PermissionWrapper>
    </div>
  );
}
