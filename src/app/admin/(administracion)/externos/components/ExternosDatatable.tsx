"use client";

import { DataTable } from "@/components/data-table/data-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { FilterType } from "@/components/data-table/types/filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthProvider";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Externo } from "../types";
import { ActivarInactivarExternoModal } from "./ActivarInactivarExternoModal";
import { AgregarEditarExternoModal } from "./AgregarEditarExternoModal";

export function ExternosDatatable() {
  const { checkPermission } = useAuth();

  const [updateTable, setUpdateTable] = useState(false);
  const [selectExterno, setSelectExterno] = useState<Externo | null>(null);
  const [agregarEditarModalOpen, setAgregarEditarModalOpen] =
    useState<boolean>(false);
  const [activarInactivarModalOpen, setActivarInactivarModalOpen] =
    useState<boolean>(false);

  const handleAgregarEditarExterno = (externo: Externo | null) => {
    setSelectExterno(externo);
    setAgregarEditarModalOpen(true);
  };

  const handleActivarInactivarExterno = (externo: Externo) => {
    setSelectExterno(externo);
    setActivarInactivarModalOpen(true);
  };

  const [permissions, setPermissions] = useState({
    create: false,
    read: false,
    update: false,
    delete: false,
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      setPermissions({
        create: await checkPermission("/admin/externos", "create"),
        read: await checkPermission("/admin/externos", "read"),
        update: await checkPermission("/admin/externos", "update"),
        delete: await checkPermission("/admin/externos", "delete"),
      });
    };

    fetchPermissions().catch(print);
  }, [checkPermission]);

  const columns: ColumnDef<Externo>[] = [
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
      accessorKey: "telefono",
      header: ({ column }) => (
        <SortableHeader column={column} title="Celular" />
      ),
      cell: ({ row }) => row.original.usuario?.persona.telefono ?? "—",
      meta: { mobileTitle: "Celular" },
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
                    onClick={() => handleAgregarEditarExterno(row.original)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Switch
                  id={"switch-externo-" + row.original.id}
                  checked={row.original.estado === "ACTIVO"}
                  onCheckedChange={() =>
                    handleActivarInactivarExterno(row.original)
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
        apiUrl={"/externos"}
        toolBarConfig={{
          components: permissions.create
            ? [
                <Button
                  key={"Agregar"}
                  title="Agregar externo"
                  variant="default"
                  className="flex gap-2"
                  onClick={() => handleAgregarEditarExterno(null)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Nuevo Externo</span>
                </Button>,
              ]
            : [],
        }}
        titulo={"Gestión de externos"}
        subtitulo="Gestión y visualización de externos"
        update={updateTable}
        onResetUpdate={() => setUpdateTable(false)}
      />
      {agregarEditarModalOpen && (
        <AgregarEditarExternoModal
          externo={selectExterno}
          isOpen={agregarEditarModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setAgregarEditarModalOpen(false)}
        />
      )}
      {activarInactivarModalOpen && (
        <ActivarInactivarExternoModal
          externo={selectExterno}
          isOpen={activarInactivarModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setActivarInactivarModalOpen(false)}
        />
      )}
    </div>
  );
}
