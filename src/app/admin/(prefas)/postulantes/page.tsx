import React from "react";
import { PostulantesDatatable } from "./components/PostulantesDatatable";
import { PermissionWrapper } from "@/components/PermissionWrapper";

export default function PostulantesPage() {
  return (
    <div className="container p-1 mt-8">
      <PermissionWrapper requiredPermission="/admin/postulantes" act={"read"}>
        <PostulantesDatatable />
      </PermissionWrapper>
    </div>
  );
}
