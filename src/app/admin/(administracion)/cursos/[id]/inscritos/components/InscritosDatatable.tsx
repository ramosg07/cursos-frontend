"use client";

import { DataTable } from "@/components/data-table/data-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Inscripcion } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterType } from "@/components/data-table/types/filter";
import { Plus, Upload, ArrowLeft, Calendar, Info } from "lucide-react";
import { AgregarInscripcionModal } from "./AgregarInscripcionModal";
import { BulkInscripcionModal } from "./BulkInscripcionModal";
import Link from "next/link";
import dayjs from "dayjs";
import { Curso } from "../../../types";
import { useAuth } from "@/contexts/AuthProvider";

interface Props {
  curso: Curso;
}

export function InscritosDatatable({ curso }: Props) {
  const idCurso = curso.id;
  const [updateTable, setUpdateTable] = useState(false);
  const [agregarInscripcionModalOpen, setAgregarInscripcionModalOpen] =
    useState<boolean>(false);
  const [bulkInscripcionModalOpen, setBulkInscripcionModalOpen] =
    useState<boolean>(false);

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
        create: await checkPermission("/admin/cursos/*/inscritos", "create"),
        read: await checkPermission("/admin/cursos/*/inscritos", "read"),
        update: await checkPermission("/admin/cursos/*/inscritos", "update"),
        delete: await checkPermission("/admin/cursos/*/inscritos", "delete"),
      });
    };

    fetchPermissions().catch(print);
  }, [checkPermission]);

  const columns: ColumnDef<Inscripcion>[] = [
    {
      accessorKey: "estudiante.usuario.persona.nroDocumento",
      header: ({ column }) => (
        <SortableHeader column={column} title="Documento" />
      ),
      meta: { mobileTitle: "Documento" },
    },
    {
      accessorKey: "estudiante.usuario.persona.nombres",
      header: ({ column }) => (
        <SortableHeader column={column} title="Estudiante" />
      ),
      cell: ({ row }) => {
        const p = row.original.estudiante?.usuario?.persona;
        if (!p) return "—";
        return `${p.nombres} ${p.primerApellido} ${p.segundoApellido ?? ""}`;
      },
      meta: { mobileTitle: "Estudiante" },
    },
    {
      accessorKey: "estudiante.usuario.correoElectronico",
      header: "Correo",
      meta: { mobileTitle: "Correo" },
    },
    {
      accessorKey: "paralelo.nombre",
      header: "Paralelo",
      cell: ({ row }) => {
        const p = row.original.paralelo;
        return p ? `Paralelo ${p.nombre}` : "—";
      },
      meta: { mobileTitle: "Paralelo" },
    },
    {
      accessorKey: "fechaInscripcion",
      header: "Fecha Inscripción",
      cell: ({ row }) =>
        dayjs(row.original.fechaInscripcion).format("DD/MM/YYYY HH:mm"),
      meta: { mobileTitle: "Fecha" },
    },
    {
      accessorKey: "estado",
      header: "Estado",
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
  ];

  const filters: FilterType[] = [
    {
      name: "filtro",
      label: "Buscador",
      value: "",
      list: [{ description: "Todos", code: "all" }],
      type: "text",
    },
    {
      name: "idParalelo",
      label: "Paralelo",
      value: "all",
      list: [
        { description: "Todos", code: "all" },
        ...(curso.paralelos || [])
          .filter((p) => p.estado === "ACTIVO")
          .map((p) => ({
            description: `Paralelo ${p.nombre}`,
            code: p.id,
          })),
      ],
      type: "select",
    },
  ];

  function updateDataTable() {
    setUpdateTable(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link href="/admin/cursos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Estudiantes Inscritos
            </h1>
            <Badge
              variant={curso.estado === "ACTIVO" ? "secondary" : "destructive"}
            >
              {curso.estado}
            </Badge>
          </div>
          <p className="text-xl text-primary font-medium">{curso.nombre}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-card shadow-sm">
          <div className="mt-1 bg-primary/10 p-2 rounded-full">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Descripción
            </p>
            <p className="text-sm">{curso.descripcion || "Sin descripción"}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-card shadow-sm">
          <div className="mt-1 bg-primary/10 p-2 rounded-full">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Fecha Inicio
            </p>
            <p className="text-sm">{curso.fechaInicio || "—"}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-card shadow-sm">
          <div className="mt-1 bg-primary/10 p-2 rounded-full">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Fecha Fin
            </p>
            <p className="text-sm">{curso.fechaFin || "—"}</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        filters={filters}
        apiUrl={"/inscripciones"}
        params={{ idCurso }}
        toolBarConfig={{
          components: [
            permissions.update && (
              <Button
                key={"BulkUpload"}
                title="Carga masiva"
                variant="outline"
                className="flex gap-2"
                onClick={() => setBulkInscripcionModalOpen(true)}
              >
                <Upload className="h-4 w-4" />
                <span>Carga Masiva</span>
              </Button>
            ),
            <Button
              key={"Agregar"}
              title="Inscribir estudiante"
              variant="default"
              className="flex gap-2"
              onClick={() => setAgregarInscripcionModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Inscribir Estudiante</span>
            </Button>,
          ],
        }}
        titulo={""}
        update={updateTable}
        onResetUpdate={() => setUpdateTable(false)}
      />

      {agregarInscripcionModalOpen && (
        <AgregarInscripcionModal
          paralelos={curso.paralelos || []}
          isOpen={agregarInscripcionModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setAgregarInscripcionModalOpen(false)}
        />
      )}
      {bulkInscripcionModalOpen && (
        <BulkInscripcionModal
          paralelos={curso.paralelos || []}
          isOpen={bulkInscripcionModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setBulkInscripcionModalOpen(false)}
        />
      )}
    </div>
  );
}
