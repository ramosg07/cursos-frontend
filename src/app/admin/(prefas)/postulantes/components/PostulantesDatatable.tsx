"use client";

import { DataTable } from "@/components/data-table/data-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FilterType } from "@/components/data-table/types/filter";
import { Edit, Plus, ShoppingCart, Upload } from "lucide-react";
import { Postulante } from "../../services/prefas.api";
import { AgregarEditarPostulanteModal } from "./AgregarEditarPostulanteModal";
import { BulkUploadPostulantesModal } from "./BulkUploadPostulantesModal";
import { useAuth } from "@/contexts/AuthProvider";
import { ComprasModal } from "./ComprasModal";

export function PostulantesDatatable() {
  const [updateTable, setUpdateTable] = useState(false);
  const [selectPostulante, setSelectPostulante] = useState<Postulante | null>(
    null,
  );
  const [agregarEditarModalOpen, setAgregarEditarModalOpen] =
    useState<boolean>(false);
  const [bulkUploadModalOpen, setBulkUploadModalOpen] =
    useState<boolean>(false);

  const [mostrarComprasModalOpen, setMostrarComprasModalOpen] =
    useState<boolean>(false);

  const handleAgregarEditar = (postulante: Postulante | null) => {
    setSelectPostulante(postulante);
    setAgregarEditarModalOpen(true);
  };

  const handleMostrarCompras = (postulante: Postulante | null) => {
    setSelectPostulante(postulante);
    setMostrarComprasModalOpen(true);
  };

  const { checkPermission } = useAuth();

  const [permissions, setPermissions] = useState({
    create: false,
    read: false,
    update: false,
    delete: false,
  });

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
                  <Button
                    title="Compras"
                    variant="outline"
                    size={"icon"}
                    onClick={() => handleMostrarCompras(row.original)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              );
            },
            meta: { mobileTitle: "Acciones" },
          },
        ]
      : []),
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

  useEffect(() => {
    const fetchPermissions = async () => {
      setPermissions({
        create: await checkPermission("/admin/postulantes", "create"),
        read: await checkPermission("/admin/postulantes", "read"),
        update: await checkPermission("/admin/postulantes", "update"),
        delete: await checkPermission("/admin/postulantes", "delete"),
      });
    };

    fetchPermissions().catch(print);
  }, [checkPermission]);

  return (
    <div>
      <DataTable
        columns={columns}
        filters={filters}
        apiUrl={"/prefas/postulantes"}
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
                  title="Agregar Postulante"
                  variant="outline"
                  size={"icon"}
                  onClick={() => handleAgregarEditar(null)}
                >
                  <Plus className="h-4 w-4" />
                </Button>,
              ]
            : [],
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
      {mostrarComprasModalOpen && (
        <ComprasModal
          postulante={selectPostulante}
          isOpen={mostrarComprasModalOpen}
          onClose={() => setMostrarComprasModalOpen(false)}
        />
      )}
      {bulkUploadModalOpen && (
        <BulkUploadPostulantesModal
          isOpen={bulkUploadModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setBulkUploadModalOpen(false)}
        />
      )}
    </div>
  );
}
