"use client";

import { DataTable } from "@/components/data-table/data-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { RolResponse, Usuario } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Constants } from "@/config/Constants";
import { FilterType } from "@/components/data-table/types/filter";
import { Edit, Key, Plus } from "lucide-react";
import { AgregarEditarUsuarioModal } from "./AgregarEditarUsuarioModa";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthProvider";
import { Switch } from "@/components/ui/switch";
import { ActivarInactivarModal } from "./ActivarInactivarModal";
import { RestablecerContrasenaModal } from "./RestablecerContrasenaModal";

export function UsuariosDatatable02() {
  const [updateTable, setUpdateTable] = useState(false);

  const [selectUser, setSelectUser] = useState<Usuario | null>(null);
  const [agregarEditarModalOpen, setAgregarEditarModalOpen] =
    useState<boolean>(false);
  const [alertaRestablecerContrasenaOpen, setAlertaRestablecerContrasenaOpen] =
    useState(false);
  const [activarInactivarModalOpen, setActivarInactivarModalOpen] =
    useState<boolean>(false);

  const { sessionRequest } = useAuth();

  const handleAgregarEditarUsuario = (usuario: Usuario | null) => {
    setSelectUser(usuario);
    setAgregarEditarModalOpen(true);
  };

  const handleActivarInactivarUsuario = async (usuario: Usuario) => {
    setSelectUser(usuario);
    setActivarInactivarModalOpen(true);
  };

  const handleAlertaRestablecerContrasena = async (usuario: Usuario) => {
    setSelectUser(usuario);
    setAlertaRestablecerContrasenaOpen(true);
  };

  const columns: ColumnDef<Usuario>[] = [
    {
      accessorKey: "urlFoto",
      header: ({ column }) => (
        <SortableHeader column={column} title="Foto de perfil" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex justify-center items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={
                  row.original.urlFoto
                    ? `${Constants.baseUrl}${row.original.urlFoto}`
                    : undefined
                }
                alt={row.original.persona?.nombres || "Avatar"}
              />
              <AvatarFallback>
                {`${row.original.persona?.nombres?.[0] || ""}${
                  row.original.persona?.primerApellido?.[0] || ""
                }`}
              </AvatarFallback>
            </Avatar>
          </div>
        );
      },
      meta: { mobileTitle: "Foto de perfil" },
    },
    {
      accessorKey: "persona.nroDocumento",
      header: ({ column }) => (
        <SortableHeader column={column} title="Nro. Documento" />
      ),
      size: 150,
      meta: { mobileTitle: "Nro. Documento" },
    },
    {
      accessorKey: "persona",
      header: ({ column }) => (
        <SortableHeader column={column} title="Nombres" />
      ),
      cell: ({ row }) => {
        let resultado = "";
        if (row.original?.persona) {
          const { nombres, primerApellido, segundoApellido } =
            row.original.persona;
          resultado = `${nombres} ${primerApellido} ${segundoApellido || ""}`;
        }
        return resultado;
      },
      meta: { mobileTitle: "Nombres" },
    },
    {
      accessorKey: "usuario",
      header: ({ column }) => (
        <SortableHeader column={column} title="Usuario" />
      ),
      meta: { mobileTitle: "Usuario" },
    },
    {
      accessorKey: "usuarioRol",
      header: "Roles",
      cell: ({ row }) => {
        return (
          <div className="flex flex-wrap gap-1">
            {(row.original.usuarioRol || []).map((ur, index) => (
              <Badge key={index}>{ur.rol.rol}</Badge>
            ))}
          </div>
        );
      },
      meta: { mobileTitle: "Roles" },
    },
    {
      accessorKey: "Estado",
      cell: ({ row }) => {
        return (
          <Badge
            variant={
              row.original.estado === "ACTIVO"
                ? "secondary"
                : row.original.estado === "INACTIVO"
                  ? "destructive"
                  : "default"
            }
          >
            {row.original.estado}
          </Badge>
        );
      },
      meta: { mobileTitle: "Estado" },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              title="Editar"
              variant="outline"
              size={"icon"}
              onClick={() => handleAgregarEditarUsuario(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleAlertaRestablecerContrasena(row.original)}
            >
              <Key className="h-4 w-4" />
            </Button>
            <Switch
              id="Activar"
              defaultChecked={row.original?.estado === "ACTIVO"}
              onCheckedChange={() => {
                handleActivarInactivarUsuario(row.original);
              }}
            />
          </div>
        );
      },
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
    // TODO: BUSCAR POR ROL
    // {
    //   name: "rol",
    //   label: "Rol",
    //   value: "",
    //   list: [{ description: "Todos", code: "all" }],
    //   type: "text",
    // },
  ];

  function updateDataTable() {
    setUpdateTable(true);
  }

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await sessionRequest<RolResponse>({
        url: "/autorizacion/roles",
        method: "get",
      });
      return response?.data.datos ?? [];
    },
  });

  return (
    <div>
      <DataTable
        columns={columns}
        filters={filters}
        apiUrl={"/usuarios"}
        toolBarConfig={{
          components: [
            <Button
              key={"Agregar"}
              title="Agregar"
              variant="outline"
              size={"icon"}
              onClick={() => handleAgregarEditarUsuario(null)}
            >
              <Plus className="h-4 w-4" />
            </Button>,
          ],
        }}
        titulo={"Gestión de usuarios"}
        update={updateTable}
        onResetUpdate={() => setUpdateTable(false)}
      />
      {agregarEditarModalOpen && (
        <AgregarEditarUsuarioModal
          usuario={selectUser}
          isOpen={agregarEditarModalOpen}
          roles={rolesData ?? []}
          onSuccess={updateDataTable}
          onClose={() => setAgregarEditarModalOpen(false)}
        />
      )}
      {activarInactivarModalOpen && (
        <ActivarInactivarModal
          isOpen={activarInactivarModalOpen}
          onClose={() => setActivarInactivarModalOpen(false)}
          onSuccess={updateDataTable}
          usuario={selectUser}
        />
      )}
      {alertaRestablecerContrasenaOpen && (
        <RestablecerContrasenaModal
          usuario={selectUser}
          isOpen={alertaRestablecerContrasenaOpen}
          onClose={() => setAlertaRestablecerContrasenaOpen(false)}
          onSuccess={updateDataTable}
        />
      )}
    </div>
  );
}
