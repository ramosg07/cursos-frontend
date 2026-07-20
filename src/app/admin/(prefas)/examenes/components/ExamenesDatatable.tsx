"use client";

import { DataTable } from "@/components/data-table/data-table";
import { FilterType } from "@/components/data-table/types/filter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { Edit, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Examen } from "../../services/prefas.api";
import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { AgregarEditarExamenModal } from "./AgregarEditarExamenModal";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";

export function ExamenesDatatable() {
  const { checkPermission } = useAuth();

  const [updateTable, setUpdateTable] = useState(false);
  const [selectExamen, setSelectExamen] = useState<Examen | null>(null);
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
        create: await checkPermission("/admin/examenes", "create"),
        read: await checkPermission("/admin/examenes", "read"),
        update: await checkPermission("/admin/examenes", "update"),
        delete: await checkPermission("/admin/examenes", "delete"),
      });
    };

    fetchPermissions().catch(print);
  }, [checkPermission]);

  const filters: FilterType[] = [
    {
      name: "filtro",
      label: "Buscar examen",
      value: "",
      list: [{ description: "Todos", code: "all" }],
      type: "text",
    },
  ];

  const handleAgregarEditar = (examen: Examen | null) => {
    setSelectExamen(examen);
    setAgregarEditarModalOpen(true);
  };

  function updateDataTable() {
    setUpdateTable(true);
  }

  const columns: ColumnDef<Examen>[] = [
    {
      accessorKey: "nombre",
      header: ({ column }) => <SortableHeader column={column} title="Nombre" />,
      meta: { mobileTitle: "Nombre" },
    },
    {
      accessorKey: "fecha",
      header: () => (
        <div className="text-center normal-case text-sm">Fecha</div>
      ),
      cell: ({ row }) =>
        dayjs.utc(row.original.fecha).format("DD/MM/YYYY") ?? "—",
      meta: { mobileTitle: "Fecha" },
    },
    {
      accessorKey: "tipo",
      header: ({ column }) => <SortableHeader column={column} title="Tipo" />,
      meta: { mobileTitle: "Tipo" },
      cell: ({ row }) => (
        <Badge variant="outline" className="font-bold border-primary/30">
          {row.original.tipo ?? "-"}
        </Badge>
      ),
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

  return (
    <div>
      <DataTable
        columns={columns}
        filters={filters}
        apiUrl={"/examenes"}
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
        titulo={"Examenes"}
        subtitulo="Administración de examenes"
        update={updateTable}
        onResetUpdate={() => setUpdateTable(false)}
      />

      {/* Modal */}
      {agregarEditarModalOpen && (
        <AgregarEditarExamenModal
          examen={selectExamen}
          isOpen={agregarEditarModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setAgregarEditarModalOpen(false)}
        />
      )}
    </div>
  );
}
