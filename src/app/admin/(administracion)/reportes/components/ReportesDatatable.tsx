"use client";

import { DataTable } from "@/components/data-table/data-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { FilterType } from "@/components/data-table/types/filter";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthProvider";
import { print } from "@/lib/print";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { UsuarioCoordinador } from "../../cursos/types";

export function ReportesDatatable() {
  const [updateTable, setUpdateTable] = useState(false);

  const { sessionRequest, checkPermission } = useAuth();

  const [permissions, setPermissions] = useState({
    create: false,
    read: false,
    update: false,
    delete: false,
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      setPermissions({
        create: await checkPermission("/admin/reportes", "create"),
        read: await checkPermission("/admin/reportes", "read"),
        update: await checkPermission("/admin/reportes", "update"),
        delete: await checkPermission("/admin/reportes", "delete"),
      });
    };

    fetchPermissions().catch(print);
  }, [checkPermission]);

  const { data: coordinadoresData } = useQuery({
    queryKey: ["coordinadores-reportes"],
    queryFn: async () => {
      const response = await sessionRequest<{
        finalizado: boolean;
        datos: { filas: UsuarioCoordinador[]; total: number };
      }>({
        url: "/usuarios/coordinadores",
        method: "get",
      });
      return response?.data.datos.filas ?? [];
    },
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "estudiante.usuario.persona.nroDocumento",
      header: ({ column }) => (
        <SortableHeader column={column} title="Documento" />
      ),
      cell: ({ row }) => {
        const docente = row.original.docente;
        const estudiante = row.original.estudiante;
        if (estudiante) {
          return (
            <div className="flex gap-1 justify-center">
              <Badge variant={"success"}>Estudiante</Badge>
              <p>{estudiante?.usuario?.persona?.nroDocumento}</p>
            </div>
          );
        }
        if (docente) {
          return (
            <div className="flex gap-1 justify-center">
              <Badge variant={"secondary"}>Docente</Badge>
              <p>{docente?.usuario?.persona?.nroDocumento}</p>
            </div>
          );
        }
        return "—";
      },
      meta: { mobileTitle: "Documento" },
    },
    {
      accessorKey: "estudiante.usuario.persona.nombres",
      header: ({ column }) => (
        <SortableHeader column={column} title="Estudiante / Docente" />
      ),
      cell: ({ row }) => {
        const docente = row.original.docente;
        const estudiante = row.original.estudiante;
        if (estudiante) {
          const p = estudiante?.usuario?.persona;
          return `${p.nombres} ${p.primerApellido} ${p.segundoApellido ?? ""}`;
        }
        if (docente) {
          const p = docente?.usuario?.persona;
          return `${p.nombres} ${p.primerApellido} ${p.segundoApellido ?? ""}`;
        }
        return "—";
      },
      meta: { mobileTitle: "Inscrito" },
    },
    {
      accessorKey: "paralelo.curso.nombre",
      header: () => (
        <div className="text-center normal-case text-sm">Curso y Paralelo</div>
      ),
      cell: ({ row }) => {
        const cursoNombre = row.original.paralelo?.curso?.nombre;
        const paraleloNombre = row.original.paralelo?.nombre;
        return `${cursoNombre || "—"} (Paralelo ${paraleloNombre || "—"})`;
      },
      meta: { mobileTitle: "Curso" },
    },
    {
      accessorKey: "fechaInscripcion",
      header: () => (
        <div className="text-center normal-case text-sm">Fecha Inscripción</div>
      ),
      cell: ({ row }) =>
        dayjs(row.original.fechaInscripcion).format("DD/MM/YYYY HH:mm"),
      meta: { mobileTitle: "Fecha" },
    },
    {
      accessorKey: "usuarioInscripcion.persona.nombres",
      header: () => (
        <div className="text-center normal-case text-sm">Registrado Por</div>
      ),
      cell: ({ row }) => {
        const p = row.original.usuarioInscripcion?.persona;
        if (!p) return "—";
        return `${p.nombres} ${p.primerApellido ?? ""} ${p.segundoApellido ?? ""}`;
      },
      meta: { mobileTitle: "Registrado Por" },
    },
  ];

  const filters: FilterType[] = [
    {
      name: "filtro",
      label: "Buscador (Estudiante / Docente)",
      value: "",
      list: [{ description: "Todos", code: "all" }],
      type: "text",
    },
    {
      name: "idUsuarioInscripcion",
      label: "Registrado por",
      value: "",
      list: [
        { description: "Todos", code: "" },
        ...(coordinadoresData?.map((c) => ({
          code: c.id,
          description: `${c.persona?.nombres} ${c.persona?.primerApellido} ${c.persona?.segundoApellido ?? ""}`.trim(),
        })) ?? []),
      ],
      type: "list",
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        filters={filters}
        apiUrl={"/inscripciones"}
        toolBarConfig={{
          components: [],
        }}
        titulo={"Gestión de inscripciones por usuario"}
        subtitulo="Gestión y visualización de inscripciones por usuario"
        update={updateTable}
        onResetUpdate={() => setUpdateTable(false)}
      />
    </div>
  );
}
