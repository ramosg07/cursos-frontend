"use client";

import { DataTable } from "@/components/data-table/data-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState, useCallback } from "react";
import { Inscripcion } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterType } from "@/components/data-table/types/filter";
import {
  Plus,
  Upload,
  ArrowLeft,
  Calendar,
  Info,
  Printer,
  BadgeDollarSign,
  UserMinus,
  Download,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AgregarInscripcionModal } from "./AgregarInscripcionModal";
import { BulkInscripcionModal } from "./BulkInscripcionModal";
import { PrintCertificatesModal } from "./PrintCertificatesModal";
import Link from "next/link";
import dayjs from "dayjs";
import { Curso } from "../../../types";
import { useAuth } from "@/contexts/AuthProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { print } from "@/lib/print";

interface Props {
  curso: Curso;
}

export function InscritosDatatable({ curso }: Props) {
  const idCurso = curso.id;
  const idPlantillaCertificado = curso.idPlantillaCertificado;
  const [updateTable, setUpdateTable] = useState(false);
  const [agregarInscripcionModalOpen, setAgregarInscripcionModalOpen] =
    useState<boolean>(false);
  const [bulkInscripcionModalOpen, setBulkInscripcionModalOpen] =
    useState<boolean>(false);
  const [printModalOpen, setPrintModalOpen] = useState<boolean>(false);
  const [selectedInscripciones, setSelectedInscripciones] = useState<string[]>(
    [],
  );
  const [estadoTab, setEstadoTab] = useState<string>("ACTIVO");

  // Función para manejar el cambio de selección en el DataTable
  const handleSelectedItemsChange = useCallback((items: Inscripcion[]) => {
    const newIds = items.map((item) => item.id);
    setSelectedInscripciones((prevIds) => {
      if (
        prevIds.length === newIds.length &&
        prevIds.every((id, index) => id === newIds[index])
      ) {
        return prevIds;
      }
      return newIds;
    });
  }, []);

  const { checkPermission, sessionRequest, user } = useAuth();

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

  const rolActivo = user?.roles.find((rol) => user.idRol === rol.idRol);
  const esCertificador = rolActivo?.rol === "CERTIFICADOR";
  const esCoordinadorGeneral = rolActivo?.rol === "COORDINADOR GENERAL";

  const columns: ColumnDef<Inscripcion>[] = [
    ...(idPlantillaCertificado && esCertificador
      ? [
          {
            id: "select",
            header: ({ table }: any) => (
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) =>
                  table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Seleccionar todo"
              />
            ),
            cell: ({ row }: any) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Seleccionar fila"
              />
            ),
            enableSorting: false,
            enableHiding: false,
          },
        ]
      : []),
    {
      accessorKey: "estudiante.usuario.persona.nroDocumento",
      header: ({ column }) => (
        <SortableHeader column={column} title="Documento" />
      ),
      meta: { mobileTitle: "Documento" },
    },
    {
      accessorKey: "estudiante.codigoPersonal",
      header: () => (
        <div className="text-center normal-case text-sm">Matrícula</div>
      ),
      meta: { mobileTitle: "Matrícula" },
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
      accessorKey: "paralelo.nombre",
      header: () => (
        <div className="text-center normal-case text-sm">Paralelo</div>
      ),
      cell: ({ row }) => {
        const p = row.original.paralelo;
        return p ? `Paralelo ${p.nombre}` : "—";
      },
      meta: { mobileTitle: "Paralelo" },
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
      accessorKey: "usuarioInscripcion",
      header: () => (
        <div className="text-center normal-case text-sm">
          Coordinador de curso
        </div>
      ),
      cell: ({ row }) => {
        const p = row.original.usuarioInscripcion?.persona;
        const p2 = row.original.usuarioDesinscripcion?.persona;
        if (!p && !p2) return "—";
        return row.original.estado === "ACTIVO"
          ? `${p.nombres} ${p.primerApellido ?? ""} ${p.segundoApellido ?? ""}`
          : `${p2.nombres} ${p2.primerApellido ?? ""} ${p2.segundoApellido ?? ""}`;
      },
      meta: { mobileTitle: "Coordinador de curso" },
    },
    {
      id: "acciones",
      header: () => (
        <div className="text-center normal-case text-sm">Acciones</div>
      ),

      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-center">
          {row.original.estado === "ACTIVO" && (
            <>
              {idPlantillaCertificado && esCertificador && (
                <Button
                  variant="ghost"
                  size="icon"
                  title="Imprimir certificado"
                  onClick={() => handleOpenPrintModal([row.original.id])}
                >
                  <Printer className="h-4 w-4" />
                </Button>
              )}

              {permissions.delete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Desinscribir">
                      <UserMinus className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción marcará la inscripción de{" "}
                        <strong>
                          {row.original.estudiante?.usuario?.persona?.nombres}{" "}
                          {
                            row.original.estudiante?.usuario?.persona
                              ?.primerApellido
                          }
                        </strong>{" "}
                        como inactiva. Podrá volver a inscribirlo después si es
                        necesario.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDesinscribir(row.original.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Confirmar Desinscripción
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
          {row.original.estado === "INACTIVO" && (
            <Badge
              variant="outline"
              className="text-destructive border-destructive/30 bg-destructive/5"
            >
              DESINCRITO
            </Badge>
          )}
        </div>
      ),
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

  const handleDesinscribir = async (id: string) => {
    try {
      const response = await sessionRequest({
        url: `/inscripciones/${id}/desinscribir`,
        method: "post",
      });
      if (response && response.data) {
        toast.success("Estudiante desinscrito correctamente");
        updateDataTable();
      }
    } catch (error: any) {
      toast.error(error?.mensaje || "Error al desinscribir");
    }
  };

  const handleOpenPrintModal = (inscripciones?: string[]) => {
    // Si no se pasan inscripciones, se usan las seleccionadas en el datatable
    setSelectedInscripciones(inscripciones || selectedInscripciones);
    setPrintModalOpen(true);
  };

  const handleExportCSV = async () => {
    try {
      toast.info("Generando reporte CSV...");
      const response = await sessionRequest<{
        datos: Inscripcion[];
        total: number;
      }>({
        url: `/inscripciones/curso/${idCurso}`,
        method: "get",
      });

      if (response && response.data) {
        const inscritos = response.data.datos;
        if (!inscritos || inscritos.length === 0) {
          toast.warning("No hay datos para exportar");
          return;
        }

        // Cabeceras: Documento, Nombres, Apellidos, Paralelo, Fecha, Monto, Estado
        const headers = [
          "Nro. Documento",
          "Matricula",
          "Estudiante",
          "Paralelo",
          "Fecha Inscripcion",
        ];

        const csvRows = [
          headers.join(","),
          ...inscritos.map((ins) => {
            const p = ins.estudiante?.usuario?.persona;
            const rowData = [
              p?.nroDocumento || "",
              ins.estudiante.codigoPersonal || "",
              `"${p?.nombres || ""} ${p?.primerApellido || ""} ${p?.segundoApellido || ""}"`,
              `"Paralelo ${ins.paralelo?.nombre || ""}"`,
              dayjs(ins.fechaInscripcion).format("DD/MM/YYYY HH:mm"),
            ];
            return rowData.join(",");
          }),
        ];

        // Usar BOM para que Excel detecte UTF-8 correctamente
        const csvContent = "\uFEFF" + csvRows.join("\n");
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const fileName = `inscritos_${curso.nombre.replace(/ /g, "_")}_${estadoTab.toLowerCase()}.csv`;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV descargado correctamente");
      }
    } catch (error) {
      print("Error al exportar los datos", error);
      toast.error("Error al exportar los datos");
    }
  };

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-card shadow-sm">
          <div className="mt-1 bg-primary/10 p-2 rounded-full">
            <BadgeDollarSign className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Monto
            </p>
            <p className="text-sm">{curso.monto || "—"}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {curso.paralelos.length > 0 &&
          curso.paralelos.map((p) => {
            const disponibles = p.cuposDisponibles ?? p.cupo;
            const inscritos = p.inscritos ?? 0;
            const porcentajeOcupado =
              p.cupo > 0 ? (inscritos / p.cupo) * 100 : 0;
            const colorVar =
              disponibles === 0
                ? "text-destructive border-destructive/30 bg-destructive/5"
                : disponibles <= 2
                  ? "text-yellow-600 border-yellow-400/30 bg-yellow-50 dark:bg-yellow-900/10"
                  : "text-green-700 border-green-400/30 bg-green-50 dark:bg-green-900/10";

            return (
              <div
                key={p.id}
                className={`flex flex-col px-3 py-2 rounded-lg border text-sm ${colorVar}`}
              >
                <span className="font-medium text-foreground">
                  Paralelo {p.nombre} : {inscritos}/{p.cupo} inscritos
                </span>
                <span className="font-medium mt-0.5">
                  {disponibles === 0
                    ? "Sin cupos"
                    : `${disponibles} cupo${
                        disponibles !== 1 ? "s" : ""
                      } restante${disponibles !== 1 ? "s" : ""}`}
                </span>
                <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      disponibles === 0
                        ? "bg-destructive"
                        : disponibles <= 2
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(porcentajeOcupado, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Tabs
          defaultValue="ACTIVO"
          value={estadoTab}
          onValueChange={setEstadoTab}
          className="w-full"
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="ACTIVO" className="flex gap-2">
                Activos
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 px-1.5 min-w-[1.25rem]"
                >
                  {curso.paralelos.reduce(
                    (acc, p) => acc + (p.inscritos ?? 0),
                    0,
                  )}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="INACTIVO">
                Desinscritos / Historial
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      <DataTable
        columns={columns}
        filters={filters}
        apiUrl={"/inscripciones"}
        params={{ idCurso, estado: estadoTab }}
        onSelectedItemsChange={handleSelectedItemsChange}
        toolBarConfig={{
          components: [
            permissions.update && esCoordinadorGeneral && (
              <Button
                key={"ExportCSV"}
                title="Exportar CSV"
                variant="outline"
                className="flex gap-2"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4" />
                <span>Exportar CSV</span>
              </Button>
            ),
            permissions.update && esCoordinadorGeneral && (
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
            idPlantillaCertificado && esCertificador && (
              <Button
                key={"PrintBatch"}
                title="Printear certificados"
                variant="outline"
                className="flex gap-2"
                onClick={() => handleOpenPrintModal()}
                disabled={selectedInscripciones.length === 0}
              >
                <Printer className="h-4 w-4" />
                <span>
                  Imprimir Seleccionados ({selectedInscripciones.length})
                </span>
              </Button>
            ),
            permissions.create && (
              <Button
                key={"Agregar"}
                title="Inscribir estudiante"
                variant="default"
                className="flex gap-2"
                onClick={() => setAgregarInscripcionModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Inscribir Estudiante</span>
              </Button>
            ),
          ],
        }}
        titulo={""}
        subtitulo={"Inscripciones del curso"}
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
      {printModalOpen && (
        <PrintCertificatesModal
          idCurso={idCurso}
          selectedInscripciones={selectedInscripciones}
          isOpen={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
        />
      )}
    </div>
  );
}
