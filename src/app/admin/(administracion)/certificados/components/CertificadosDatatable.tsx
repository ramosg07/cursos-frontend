"use client";

import { DataTable } from "@/components/data-table/data-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { PlantillaCertificado } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterType } from "@/components/data-table/types/filter";
import { Plus, Edit } from "lucide-react";
import dayjs from "dayjs";

interface Props {
  onEdit: (plantilla: PlantillaCertificado) => void;
  onAdd: () => void;
}

export function CertificadosDatatable({ onEdit, onAdd }: Props) {
  const [updateTable, setUpdateTable] = useState(false);

  const columns: ColumnDef<PlantillaCertificado>[] = [
    {
      accessorKey: "nombre",
      header: ({ column }) => <SortableHeader column={column} title="Nombre" />,
      meta: { mobileTitle: "Nombre" },
    },
    {
      accessorKey: "orientacion",
      header: () => (
        <div className="text-center normal-case text-sm">Orientación</div>
      ),
      meta: { mobileTitle: "Orientación" },
    },
    {
      accessorKey: "fechaCreacion",
      header: () => (
        <div className="text-center normal-case text-sm">Fecha Creación</div>
      ),
      cell: ({ row }) =>
        dayjs((row.original as any).fechaCreacion).format("DD/MM/YYYY"),
      meta: { mobileTitle: "Fecha" },
    },
    {
      accessorKey: "estado",
      header: () => (
        <div className="text-center normal-case text-sm">Estado</div>
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
      id: "acciones",
      header: () => (
        <div className="text-center normal-case text-sm">Acciones</div>
      ),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterType[] = [
    {
      name: "filtro",
      label: "Buscador",
      value: "",
      list: [{ description: "Todos", code: "all" }],
      type: "text",
    },
  ];

  return (
    <DataTable
      columns={columns}
      filters={filters}
      apiUrl={"/plantillas-certificados"}
      titulo={"Plantillas de Certificados"}
      update={updateTable}
      onResetUpdate={() => setUpdateTable(false)}
      toolBarConfig={{
        components: [
          <Button key="Add" onClick={onAdd} className="flex gap-2">
            <Plus className="h-4 w-4" />
            <span>Nueva Plantilla</span>
          </Button>,
        ],
      }}
    />
  );
}
