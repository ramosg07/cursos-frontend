"use client";

import { DataTable } from "@/components/data-table/data-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Curso, UsuarioCoordinador } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterType } from "@/components/data-table/types/filter";
import { Edit, FileBadge, Plus, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthProvider";
import { AgregarEditarCursoModal } from "./AgregarEditarCursoModal";
import { ActivarInactivarCursoModal } from "./ActivarInactivarCursoModal";
import Link from "next/link";
import { ElegirPlantillaModal } from "./ElegirPlantillaModal";

export function CursosDatatable() {
  const [updateTable, setUpdateTable] = useState(false);
  const [selectCurso, setSelectCurso] = useState<Curso | null>(null);
  const [agregarEditarModalOpen, setAgregarEditarModalOpen] =
    useState<boolean>(false);
  const [activarInactivarModalOpen, setActivarInactivarModalOpen] =
    useState<boolean>(false);

  const [elegirPlantillaModalOpen, setElegirPlantillaModalOpen] =
    useState<boolean>(false);

  const { sessionRequest, user, checkPermission } = useAuth();

  const rolActivo = user?.roles.find((rol) => user.idRol === rol.idRol);
  const coordinadorGeneral = rolActivo?.rol === "COORDINADOR GENERAL";
  const handleAgregarEditarCurso = (curso: Curso | null) => {
    setSelectCurso(curso);
    setAgregarEditarModalOpen(true);
  };

  const handleActivarInactivarCurso = (curso: Curso) => {
    setSelectCurso(curso);
    setActivarInactivarModalOpen(true);
  };

  const handleElegirPlantilla = (curso: Curso) => {
    setSelectCurso(curso);
    setElegirPlantillaModalOpen(true);
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
        create: await checkPermission("/admin/cursos", "create"),
        read: await checkPermission("/admin/cursos", "read"),
        update: await checkPermission("/admin/cursos", "update"),
        delete: await checkPermission("/admin/cursos", "delete"),
      });
    };

    fetchPermissions().catch(print);
  }, [checkPermission]);

  const columns: ColumnDef<Curso>[] = [
    {
      accessorKey: "nombre",
      header: ({ column }) => <SortableHeader column={column} title="Nombre" />,
      meta: { mobileTitle: "Nombre" },
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => row.original.descripcion ?? "—",
      meta: { mobileTitle: "Descripción" },
    },
    {
      accessorKey: "fechaInicio",
      header: "Fecha Inicio",
      cell: ({ row }) => row.original.fechaInicio ?? "—",
      meta: { mobileTitle: "Fecha Inicio" },
    },
    {
      accessorKey: "fechaFin",
      header: "Fecha Fin",
      cell: ({ row }) => row.original.fechaFin ?? "—",
      meta: { mobileTitle: "Fecha Fin" },
    },
    {
      accessorKey: "cursoCoordinador",
      header: "Coordinadores",
      cell: ({ row }) => {
        const coordinadores = row.original.cursoCoordinador ?? [];
        if (coordinadores.length === 0) return "—";
        return (
          <div className="flex flex-wrap gap-1">
            {coordinadores.map((cc) => (
              <Badge key={cc.id} variant="outline">
                {cc.usuario?.persona?.nombres}{" "}
                {cc.usuario?.persona?.primerApellido}
              </Badge>
            ))}
          </div>
        );
      },
      meta: { mobileTitle: "Coordinadores" },
    },
    {
      accessorKey: "monto",
      header: "Monto (Bs.)",
      cell: ({ row }) => Number(row.original.monto).toFixed(2),
      meta: { mobileTitle: "Monto" },
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
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {permissions.read && (
            <Link href={`/admin/cursos/${row.original.id}/inscritos`}>
              <Button title="Ver Inscritos" variant="outline" size={"icon"}>
                <Users className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Button
            title="Editar"
            variant="outline"
            size={"icon"}
            onClick={() => handleAgregarEditarCurso(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {row.original.estado === "ACTIVO" && coordinadorGeneral && (
            <Switch
              id={"switch-curso-" + row.original.id}
              defaultChecked={row.original.estado === "ACTIVO"}
              onCheckedChange={() => handleActivarInactivarCurso(row.original)}
            />
          )}
          {row.original.estado === "ACTIVO" && coordinadorGeneral && (
            <Button
              title="Elegir Plantilla"
              variant="outline"
              size={"icon"}
              onClick={() => handleElegirPlantilla(row.original)}
            >
              <FileBadge className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      meta: { mobileTitle: "Acciones" },
    },
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

  const { data: coordinadoresData } = useQuery({
    queryKey: ["coordinadores-curso"],
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

  return (
    <div>
      <DataTable
        columns={columns}
        filters={filters}
        apiUrl={"/cursos"}
        toolBarConfig={{
          components: [
            permissions.create && (
              <Button
                key={"Agregar"}
                title="Agregar curso"
                variant="outline"
                size={"icon"}
                onClick={() => handleAgregarEditarCurso(null)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            ),
          ],
        }}
        titulo={"Gestión de cursos"}
        update={updateTable}
        onResetUpdate={() => setUpdateTable(false)}
      />
      {agregarEditarModalOpen && (
        <AgregarEditarCursoModal
          curso={selectCurso}
          isOpen={agregarEditarModalOpen}
          coordinadoresDisponibles={coordinadoresData ?? []}
          onSuccess={updateDataTable}
          onClose={() => setAgregarEditarModalOpen(false)}
        />
      )}
      {activarInactivarModalOpen && (
        <ActivarInactivarCursoModal
          curso={selectCurso}
          isOpen={activarInactivarModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setActivarInactivarModalOpen(false)}
        />
      )}
      {elegirPlantillaModalOpen && (
        <ElegirPlantillaModal
          curso={selectCurso}
          isOpen={elegirPlantillaModalOpen}
          onSuccess={updateDataTable}
          onClose={() => setElegirPlantillaModalOpen(false)}
        />
      )}
    </div>
  );
}
