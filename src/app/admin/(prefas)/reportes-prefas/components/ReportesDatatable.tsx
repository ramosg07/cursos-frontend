"use client";

import { DataTable } from "@/components/data-table/data-table";
import { SortableHeader } from "@/components/data-table/sortable-header";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { FilterType } from "@/components/data-table/types/filter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type DetalleVenta = {
  id: string;
  cantidad: number;
  precioUnitario: number;
  producto: {
    nombre: string;
  };
};

type VentaPrefa = {
  id: string;
  numeroRecibo: string;
  montoTotal: number;
  fechaVenta: string;
  postulante: {
    nombres: string;
    primerApellido: string;
    segundoApellido?: string;
    nroDocumento: string;
  };
  vendedor: {
    usuario: string;
    persona: {
      nombres: string;
      primerApellido: string;
      segundoApellido?: string;
    };
  };
  detalles: DetalleVenta[];
};

// ─── Componente principal ─────────────────────────────────────────────────────

export function ReportesDatatable() {
  const [updateTable, setUpdateTable] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState<VentaPrefa | null>(null);

  const nombreCompleto = (p: {
    nombres: string;
    primerApellido: string;
    segundoApellido?: string;
  }) =>
    [p.nombres, p.primerApellido, p.segundoApellido].filter(Boolean).join(" ");

  const columns: ColumnDef<VentaPrefa>[] = [
    {
      id: "postulante",
      header: ({ column }) => (
        <SortableHeader column={column} title="Postulante" />
      ),
      cell: ({ row }) => {
        const p = row.original.postulante;
        return (
          <div className="flex flex-col">
            <span className="font-semibold">{nombreCompleto(p)}</span>
            <span className="text-xs text-muted-foreground font-mono">
              CI: {p.nroDocumento}
            </span>
          </div>
        );
      },
      meta: { mobileTitle: "Postulante" },
    },
    {
      accessorKey: "numeroRecibo",
      header: ({ column }) => (
        <SortableHeader column={column} title="Nro Recibo" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.numeroRecibo}</span>
      ),
      meta: { mobileTitle: "Nro Recibo" },
    },
    {
      accessorKey: "montoTotal",
      header: ({ column }) => (
        <SortableHeader column={column} title="Monto (Bs.)" />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-bold text-green-600">
          Bs. {Number(row.original.montoTotal).toFixed(2)}
        </span>
      ),
      meta: { mobileTitle: "Monto" },
    },
    {
      id: "vendedor",
      header: ({ column }) => (
        <SortableHeader column={column} title="Vendido por" />
      ),
      cell: ({ row }) => {
        const v = row.original.vendedor;
        return (
          <div className="flex flex-col">
            <span className="font-semibold">{nombreCompleto(v.persona)}</span>
            <span className="text-xs text-muted-foreground font-mono">
              @{v.usuario}
            </span>
          </div>
        );
      },
      meta: { mobileTitle: "Vendedor" },
    },
    {
      accessorKey: "fechaVenta",
      header: ({ column }) => <SortableHeader column={column} title="Fecha" />,
      cell: ({ row }) => (
        <span className="text-sm">
          {dayjs(row.original.fechaVenta).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
      meta: { mobileTitle: "Fecha" },
    },
    {
      id: "acciones",
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={() => setVentaDetalle(row.original)}
        >
          <Eye className="h-4 w-4" />
          Ver detalle
        </Button>
      ),
    },
  ];

  const filters: FilterType[] = [
    {
      name: "fechaInicio",
      label: "Fecha Inicio",
      value: format(new Date(), "yyyy-MM-dd"),
      list: [],
      type: "date",
    },
    {
      name: "fechaFin",
      label: "Fecha Fin",
      value: format(new Date(), "yyyy-MM-dd"),
      list: [],
      type: "date",
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        filters={filters}
        apiUrl={"/prefas/reportes/ventas"}
        toolBarConfig={{
          components: [],
        }}
        titulo={"Reporte de Ventas Prefas"}
        subtitulo="Listado completo de ventas realizadas en el módulo PREFAS"
        update={updateTable}
        onResetUpdate={() => setUpdateTable(false)}
      />

      {/* ── Modal de detalle de venta ─────────────────────────────────── */}
      <Dialog
        open={!!ventaDetalle}
        onOpenChange={(open) => !open && setVentaDetalle(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Detalle de Venta — Recibo #{ventaDetalle?.numeroRecibo}
            </DialogTitle>
          </DialogHeader>

          {ventaDetalle && (
            <div className="space-y-4">
              {/* Info rápida */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">
                    Postulante
                  </p>
                  <p className="font-semibold">
                    {nombreCompleto(ventaDetalle.postulante)}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    CI: {ventaDetalle.postulante.nroDocumento}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">
                    Vendido por
                  </p>
                  <p className="font-semibold">
                    {nombreCompleto(ventaDetalle.vendedor.persona)}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    @{ventaDetalle.vendedor.usuario}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">
                    Fecha
                  </p>
                  <p>
                    {dayjs(ventaDetalle.fechaVenta).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">
                    Total
                  </p>
                  <p className="font-mono font-bold text-green-600 text-lg">
                    Bs. {Number(ventaDetalle.montoTotal).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Tabla de productos */}
              <div>
                <p className="text-sm font-semibold mb-2">Productos vendidos</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-center">Cant.</TableHead>
                      <TableHead className="text-right">Precio unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ventaDetalle.detalles.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{d.producto.nombre}</TableCell>
                        <TableCell className="text-center font-mono">
                          {d.cantidad}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          Bs. {Number(d.precioUnitario).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          Bs. {(d.cantidad * d.precioUnitario).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
