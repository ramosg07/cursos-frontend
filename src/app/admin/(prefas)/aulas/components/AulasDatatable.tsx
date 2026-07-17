"use client";

import { DataTable } from "@/components/data-table/data-table";
import { FilterType } from "@/components/data-table/types/filter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Edit, Plus } from "lucide-react";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { Aula } from "../../services/prefas.api";
import { AgregarEditarAulaModal } from "./AgregarEditarAulaModal";

export function AulasDatatable() {
  const { checkPermission } = useAuth();

  const [updateTable, setUpdateTable] = useState(false);
  const [selectAula, setSelectAula] = useState<Aula | null>(null);
  const [agregarEditarModalOpen, setAgregarEditarModalOpen] =
    useState<boolean>(false);

  const [permissions, setPermissions] = useState({
    create: false,
    read: false,
    update: false,
    delete: false,
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      setPermissions({
        create: await checkPermission("/admin/aulas", "create"),
        read: await checkPermission("/admin/aulas", "read"),
        update: await checkPermission("/admin/aulas", "update"),
        delete: await checkPermission("/admin/aulas", "delete"),
      });
    };

    fetchPermissions().catch(print);
  }, [checkPermission]);

  const filters: FilterType[] = [
    {
      name: "filtro",
      label: "Buscar aula",
      value: "",
      list: [{ description: "Todos", code: "all" }],
      type: "text",
    },
  ];

  const columns: ColumnDef<Aula>[] = [
    {
      accessorKey: "nombre",
      header: ({ column }) => <SortableHeader column={column} title="Nombre" />,
      meta: { mobileTitle: "Nombre" },
    },
    {
      accessorKey: "piso",
      header: ({ column }) => <SortableHeader column={column} title="Piso" />,
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700`}
        >
          {row.original.piso}
        </span>
      ),
      meta: { mobileTitle: "Piso" },
    },
    {
      accessorKey: "columnainicio",
      header: ({ column }) => (
        <SortableHeader column={column} title="Columna inicio" />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-bold">
          {row.original.columnaInicio}
        </span>
      ),
      meta: { mobileTitle: "Columna inicio" },
    },
    {
      accessorKey: "columnafinal",
      header: ({ column }) => (
        <SortableHeader column={column} title="Columna final" />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-bold">{row.original.columnaFin}</span>
      ),
      meta: { mobileTitle: "Columna final" },
    },
    {
      accessorKey: "filas",
      header: ({ column }) => <SortableHeader column={column} title="Filas" />,
      cell: ({ row }) => (
        <span className={`font-bold text-green-600`}>{row.original.filas}</span>
      ),
      meta: { mobileTitle: "Filas" },
    },
    {
      accessorKey: "capacidad",
      header: ({ column }) => (
        <SortableHeader column={column} title="Capacidad" />
      ),
      cell: ({ row }) => (
        <span className={`font-bold text-green-600`}>
          {row.original.capacidad}
        </span>
      ),
      meta: { mobileTitle: "Capacidad" },
    },
    ...(permissions.update
      ? [
          {
            id: "actions",
            header: () => (
              <div className="text-center normal-case text-sm">Acciones</div>
            ),
            cell: ({ row }: any) => {
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
        ]
      : []),
  ];

  const handleAgregarEditar = (aula: Aula | null) => {
    setSelectAula(aula);
    setAgregarEditarModalOpen(true);
  };

  function updateDataTable() {
    setUpdateTable(true);
  }

  return (
    <div>
      <DataTable
        columns={columns}
        filters={filters}
        apiUrl={"/aulas"}
        toolBarConfig={{
          components: [
            permissions.create
              ? [
                  <Button
                    key={"Agregar"}
                    title="Agregar Ítem"
                    variant="outline"
                    size={"icon"}
                    onClick={() => handleAgregarEditar(null)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>,
                ]
              : [],
          ],
        }}
        titulo={"Aulas"}
        subtitulo="Administración de aulas"
        update={updateTable}
        onResetUpdate={() => setUpdateTable(false)}
      />

      {/* Modal */}
      {agregarEditarModalOpen && (
        <AgregarEditarAulaModal
          aula={selectAula}
          isOpen={agregarEditarModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setAgregarEditarModalOpen(false)}
        />
      )}
    </div>
  );
}
