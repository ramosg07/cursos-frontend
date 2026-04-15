"use client";

import { DataTable } from "@/components/data-table/data-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Estudiante } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterType } from "@/components/data-table/types/filter";
import { Edit, Plus, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AgregarEditarEstudianteModal } from "./AgregarEditarEstudianteModal";
import { ActivarInactivarEstudianteModal } from "./ActivarInactivarEstudianteModal";
import { BulkUploadModal } from "./BulkUploadModal";

export function EstudiantesDatatable() {
  const [updateTable, setUpdateTable] = useState(false);
  const [selectEstudiante, setSelectEstudiante] = useState<Estudiante | null>(
    null,
  );
  const [agregarEditarModalOpen, setAgregarEditarModalOpen] =
    useState<boolean>(false);
  const [activarInactivarModalOpen, setActivarInactivarModalOpen] =
    useState<boolean>(false);
  const [bulkUploadModalOpen, setBulkUploadModalOpen] =
    useState<boolean>(false);

  const handleAgregarEditarEstudiante = (estudiante: Estudiante | null) => {
    setSelectEstudiante(estudiante);
    setAgregarEditarModalOpen(true);
  };

  const handleActivarInactivarEstudiante = (estudiante: Estudiante) => {
    setSelectEstudiante(estudiante);
    setActivarInactivarModalOpen(true);
  };

  const columns: ColumnDef<Estudiante>[] = [
    {
      accessorKey: "usuario.persona.nroDocumento",
      header: ({ column }) => (
        <SortableHeader column={column} title="Documento" />
      ),
      meta: { mobileTitle: "Documento" },
    },
    {
      accessorKey: "persona",
      header: ({ column }) => (
        <SortableHeader column={column} title="Nombre Completo" />
      ),
      cell: ({ row }) => {
        const p = row.original.usuario?.persona;
        if (!p) return "—";
        return `${p.nombres} ${p.primerApellido} ${p.segundoApellido ?? ""}`;
      },
      meta: { mobileTitle: "Nombre" },
    },
    {
      accessorKey: "codigoPersonal",
      header: ({ column }) => (
        <SortableHeader column={column} title="Matrícula" />
      ),
      cell: ({ row }) => row.original.codigoPersonal ?? "—",
      meta: { mobileTitle: "Matrícula" },
    },
    {
      accessorKey: "estado",
      header: ({ column }) => (
        <SortableHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.estado === "ACTIVO" ? "secondary" : "destructive"
          }
        >
          {row.original.estado}
        </Badge>
      ),
      meta: { mobileTitle: "Estado" },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-center normal-case text-sm">Acciones</div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.estado === "ACTIVO" && (
            <Button
              title="Editar"
              variant="outline"
              size={"icon"}
              onClick={() => handleAgregarEditarEstudiante(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Switch
            id={"switch-estudiante-" + row.original.id}
            checked={row.original.estado === "ACTIVO"}
            onCheckedChange={() =>
              handleActivarInactivarEstudiante(row.original)
            }
          />
        </div>
      ),
      meta: { mobileTitle: "Acciones" },
    },
  ];

  const filters: FilterType[] = [
    {
      name: "filtro",
      label: "Filtro",
      value: "",
      list: [{ description: "Todos", code: "all" }],
      type: "text",
    },
  ];

  function updateDataTable() {
    setUpdateTable(true);
  }

  return (
    <div>
      <DataTable
        columns={columns}
        filters={filters}
        apiUrl={"/estudiantes"}
        toolBarConfig={{
          components: [
            <Button
              key={"BulkUpload"}
              title="Carga masiva"
              variant="outline"
              className="flex gap-2"
              onClick={() => setBulkUploadModalOpen(true)}
            >
              <Upload className="h-4 w-4" />
              <span>Carga Masiva</span>
            </Button>,
            <Button
              key={"Agregar"}
              title="Agregar estudiante"
              variant="default"
              className="flex gap-2"
              onClick={() => handleAgregarEditarEstudiante(null)}
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Estudiante</span>
            </Button>,
          ],
        }}
        titulo={"Gestión de estudiantes"}
        update={updateTable}
        onResetUpdate={() => setUpdateTable(false)}
      />
      {agregarEditarModalOpen && (
        <AgregarEditarEstudianteModal
          estudiante={selectEstudiante}
          isOpen={agregarEditarModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setAgregarEditarModalOpen(false)}
        />
      )}
      {activarInactivarModalOpen && (
        <ActivarInactivarEstudianteModal
          estudiante={selectEstudiante}
          isOpen={activarInactivarModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setActivarInactivarModalOpen(false)}
        />
      )}
      {bulkUploadModalOpen && (
        <BulkUploadModal
          isOpen={bulkUploadModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setBulkUploadModalOpen(false)}
        />
      )}
    </div>
  );
}
