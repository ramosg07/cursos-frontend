"use client";

import { DataTable } from "@/components/data-table/data-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilterType } from "@/components/data-table/types/filter";
import { Edit, Plus } from "lucide-react";
import { Postulante } from "../../services/prefas.api";
import { AgregarEditarPostulanteModal } from "./AgregarEditarPostulanteModal";

export function PostulantesDatatable() {
  const [updateTable, setUpdateTable] = useState(false);
  const [selectPostulante, setSelectPostulante] = useState<Postulante | null>(
    null,
  );
  const [agregarEditarModalOpen, setAgregarEditarModalOpen] =
    useState<boolean>(false);

  const handleAgregarEditar = (postulante: Postulante | null) => {
    setSelectPostulante(postulante);
    setAgregarEditarModalOpen(true);
  };

  const columns: ColumnDef<Postulante>[] = [
    {
      accessorKey: "nroDocumento",
      header: ({ column }) => (
        <SortableHeader column={column} title="Documento" />
      ),
      meta: { mobileTitle: "Nro. Documento" },
    },
    {
      accessorKey: "nombres",
      header: ({ column }) => (
        <SortableHeader column={column} title="Nombres" />
      ),
      meta: { mobileTitle: "Nombres" },
    },
    {
      accessorKey: "primerApellido",
      header: ({ column }) => (
        <SortableHeader column={column} title="Primer Apellido" />
      ),
      meta: { mobileTitle: "Primer Apellido" },
    },
    {
      accessorKey: "segundoApellido",
      header: ({ column }) => (
        <SortableHeader column={column} title="Segundo Apellido" />
      ),
      meta: { mobileTitle: "Segundo Apellido" },
    },
    {
      accessorKey: "celular",
      header: ({ column }) => (
        <SortableHeader column={column} title="Celular" />
      ),
      meta: { mobileTitle: "Celular" },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-center normal-case text-sm">Acciones</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 justify-center">
            <Button
              title="Editar"
              variant="outline"
              size={"icon"}
              onClick={() => handleAgregarEditar(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      meta: { mobileTitle: "Acciones" },
    },
  ];

  const filters: FilterType[] = [
    {
      name: "filtro",
      label: "Buscar por documento/nombre/apellido",
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
        apiUrl={"/prefas/postulantes"}
        toolBarConfig={{
          components: [
            <Button
              key={"Agregar"}
              title="Agregar Postulante"
              variant="outline"
              size={"icon"}
              onClick={() => handleAgregarEditar(null)}
            >
              <Plus className="h-4 w-4" />
            </Button>,
          ],
        }}
        titulo={"Gestión de Postulantes"}
        subtitulo="Administración de personas interesadas (PREFAS)"
        update={updateTable}
        onResetUpdate={() => setUpdateTable(false)}
      />

      {agregarEditarModalOpen && (
        <AgregarEditarPostulanteModal
          postulante={selectPostulante}
          isOpen={agregarEditarModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setAgregarEditarModalOpen(false)}
        />
      )}
    </div>
  );
}
