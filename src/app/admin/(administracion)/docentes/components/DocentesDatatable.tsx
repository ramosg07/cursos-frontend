"use client";

import { DataTable } from "@/components/data-table/data-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Docente } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterType } from "@/components/data-table/types/filter";
import { Edit, Plus, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AgregarEditarDocenteModal } from "./AgregarEditarDocenteModal";
import { ActivarInactivarDocenteModal } from "./ActivarInactivarDocenteModal";
import { BulkUploadDocenteModal } from "./BulkUploadDocenteModal";
import { useAuth } from "@/contexts/AuthProvider";

export function DocentesDatatable() {
  const [updateTable, setUpdateTable] = useState(false);
  const [selectDocente, setSelectDocente] = useState<Docente | null>(
    null,
  );
  const [agregarEditarModalOpen, setAgregarEditarModalOpen] =
    useState<boolean>(false);
  const [activarInactivarModalOpen, setActivarInactivarModalOpen] =
    useState<boolean>(false);
  const [bulkUploadModalOpen, setBulkUploadModalOpen] =
    useState<boolean>(false);

  const handleAgregarEditarDocente = (docente: Docente | null) => {
    setSelectDocente(docente);
    setAgregarEditarModalOpen(true);
  };

  const handleActivarInactivarDocente = (docente: Docente) => {
    setSelectDocente(docente);
    setActivarInactivarModalOpen(true);
  };

  const { checkPermission } = useAuth();

  const [permissions, setPermissions] = useState({
    create: false,
    read: false,
    update: false,
    delete: false,
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      setPermissions({
        create: await checkPermission("/admin/docentes", "create"),
        read: await checkPermission("/admin/docentes", "read"),
        update: await checkPermission("/admin/docentes", "update"),
        delete: await checkPermission("/admin/docentes", "delete"),
      });
    };

    fetchPermissions().catch(print);
  }, [checkPermission]);

  const columns: ColumnDef<Docente>[] = [
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
      accessorKey: "estado",
      header: ({ column }) => <SortableHeader column={column} title="Estado" />,
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
    ...(permissions.update
      ? [
        {
          id: "actions",
          header: () => (
            <div className="text-center normal-case text-sm">Acciones</div>
          ),
          cell: ({ row }: any) => (
            <div className="flex items-center gap-2">
              {row.original.estado === "ACTIVO" && (
                <Button
                  title="Editar"
                  variant="outline"
                  size={"icon"}
                  onClick={() => handleAgregarEditarDocente(row.original)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Switch
                id={"switch-docente-" + row.original.id}
                checked={row.original.estado === "ACTIVO"}
                onCheckedChange={() =>
                  handleActivarInactivarDocente(row.original)
                }
              />
            </div>
          ),
          meta: { mobileTitle: "Acciones" },
        },
      ]
      : []),
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
        apiUrl={"/docentes"}
        toolBarConfig={{
          components: permissions.create
            ? [
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
                title="Agregar docente"
                variant="default"
                className="flex gap-2"
                onClick={() => handleAgregarEditarDocente(null)}
              >
                <Plus className="h-4 w-4" />
                <span>Nuevo Docente</span>
              </Button>,
            ]
            : [],
        }}
        titulo={"Gestión de docentes"}
        subtitulo="Gestión y visualización de docentes"
        update={updateTable}
        onResetUpdate={() => setUpdateTable(false)}
      />
      {agregarEditarModalOpen && (
        <AgregarEditarDocenteModal
          docente={selectDocente}
          isOpen={agregarEditarModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setAgregarEditarModalOpen(false)}
        />
      )}
      {activarInactivarModalOpen && (
        <ActivarInactivarDocenteModal
          docente={selectDocente}
          isOpen={activarInactivarModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setActivarInactivarModalOpen(false)}
        />
      )}
      {bulkUploadModalOpen && (
        <BulkUploadDocenteModal
          isOpen={bulkUploadModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setBulkUploadModalOpen(false)}
        />
      )}
    </div>
  );
}
