"use client";

import { DataTable } from "@/components/data-table/data-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilterType } from "@/components/data-table/types/filter";
import { Edit, Plus } from "lucide-react";
import { ProductoPrefa } from "../../services/prefas.api";
import { AgregarEditarProductoModal } from "./AgregarEditarProductoModal";

export function ProductosDatatable() {
  const [updateTable, setUpdateTable] = useState(false);
  const [selectProducto, setSelectProducto] = useState<ProductoPrefa | null>(
    null,
  );
  const [agregarEditarModalOpen, setAgregarEditarModalOpen] =
    useState<boolean>(false);

  const handleAgregarEditar = (producto: ProductoPrefa | null) => {
    setSelectProducto(producto);
    setAgregarEditarModalOpen(true);
  };

  const columns: ColumnDef<ProductoPrefa>[] = [
    {
      accessorKey: "nombre",
      header: ({ column }) => <SortableHeader column={column} title="Nombre" />,
      meta: { mobileTitle: "Nombre" },
    },
    {
      accessorKey: "tipo",
      header: ({ column }) => <SortableHeader column={column} title="Tipo" />,
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-md text-xs font-bold ${row.original.tipo === "CURSO" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
        >
          {row.original.tipo}
        </span>
      ),
      meta: { mobileTitle: "Tipo" },
    },
    {
      accessorKey: "precio",
      header: ({ column }) => (
        <SortableHeader column={column} title="Precio (Bs)" />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-bold">{row.original.precio}</span>
      ),
      meta: { mobileTitle: "Precio" },
    },
    {
      accessorKey: "stock",
      header: ({ column }) => <SortableHeader column={column} title="Stock" />,
      cell: ({ row }) => (
        <span
          className={`font-bold ${row.original.stock < 5 ? "text-red-500" : "text-green-600"}`}
        >
          {row.original.stock}
        </span>
      ),
      meta: { mobileTitle: "Stock" },
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
      label: "Buscar producto",
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
        apiUrl={"/prefas/productos"}
        toolBarConfig={{
          components: [
            <Button
              key={"Agregar"}
              title="Agregar Ítem"
              variant="outline"
              size={"icon"}
              onClick={() => handleAgregarEditar(null)}
            >
              <Plus className="h-4 w-4" />
            </Button>,
          ],
        }}
        titulo={"Inventario de Productos y Cursos"}
        subtitulo="Administración de catálogo (PREFAS)"
        update={updateTable}
        onResetUpdate={() => setUpdateTable(false)}
      />

      {/* Modal Placeholder */}
      {agregarEditarModalOpen && (
        <AgregarEditarProductoModal
          producto={selectProducto}
          isOpen={agregarEditarModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setAgregarEditarModalOpen(false)}
        />
      )}
    </div>
  );
}
