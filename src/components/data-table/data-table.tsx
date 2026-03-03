"use client";

import { useCallback, useEffect, useState } from "react";
import { DataTableProps, ToolBarConfigType } from "./types/datatable";
import { Button } from "../ui/button";
import {
  ChevronDownIcon,
  ColumnsIcon,
  RefreshCw,
  Search,
  XIcon,
} from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthProvider";
import { DataTableSkeleton } from "./data-table-skeleton";
import { DataTableError } from "./data-table-error";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { DataTableEmpty } from "./data-table-empty";
import { DataTablePagination } from "./data-table-pagination";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
} from "../ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { DataTableFilter } from "./data-table-filter";

export function DataTable<TData, TValue>({
  columns,
  filters = [],
  apiUrl,
  defaultSorting = [],
  toolBarConfig = {
    showSearch: true,
    showRefresh: true,
    showColumns: true,
    components: [],
  },
  titulo,
  update,
  onResetUpdate,
  params,
}: DataTableProps<TData, TValue>) {
  const { sessionRequest } = useAuth();
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const getActionsTable = (
    defaultActions: React.ReactNode[],
    toolBarConfig: ToolBarConfigType,
  ) => {
    const result: React.ReactNode[] = [];

    if (!toolBarConfig?.showRefresh != false) {
      result.push(defaultActions[0]);
    }

    if (!toolBarConfig?.showSearch != false) {
      result.push(defaultActions[1]);
    }

    if (!toolBarConfig?.showColumns != false) {
      result.push(defaultActions[2]);
    }

    (toolBarConfig.components || []).forEach((component) => {
      result.push(component);
    });

    return result;
  };

  const fetchData = useCallback(async () => {
    const queryParams: Record<string, string> = {
      pagina: (pagination.pageIndex + 1).toString(),
      limite: pagination.pageSize.toString(),
      ...(params || {}),
    };

    Object.keys(appliedFilters).forEach((key) => {
      if (appliedFilters[key] !== "" && appliedFilters[key] !== undefined) {
        queryParams[key] = appliedFilters[key];
      }
    });

    if (sorting.length > 0) {
      const [{ id, desc }] = sorting;
      queryParams.orden = `${desc ? "-" : ""}${id}`;
    }

    console.warn({ queryParams });

    const response = await sessionRequest<any>({
      url: apiUrl,
      method: "GET",
      params: queryParams,
    });

    return response?.data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, appliedFilters, sorting, apiUrl, params]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: [
      "dataTable",
      apiUrl,
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      appliedFilters,
      params,
    ],
    queryFn: fetchData,
    placeholderData: keepPreviousData,
  });

  const table = useReactTable({
    data: data?.datos?.filas || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: data?.datos?.total || 1,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  const getColumnTitle = (column: ColumnDef<TData, any>) => {
    if (column.meta && "mobileTitle" in column.meta)
      return column.meta.mobileTitle as string;

    if (typeof column.header == "string") return column.header;

    return column.id || "";
  };

  const actionsTable = [
    <Button
      key={"buttonBuscar"}
      id={"buttonBuscar"}
      size={"sm"}
      variant={"outline"}
      onClick={toggleFilters}
    >
      {showFilters ? (
        <XIcon className="mr-2 h-4 w-4" />
      ) : (
        <Search className="mr-2 h-4 w-4" />
      )}
      {showFilters ? "Cancelar" : "Buscar"}
    </Button>,
    <Button
      key={"buttonRecargar"}
      id={"buttonRecargar"}
      size={"sm"}
      variant={"outline"}
      onClick={async () => {
        await reloadData();
      }}
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      Recargar
    </Button>,
    <DropdownMenu key={"dropdownMenuVista"}>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} size={"sm"}>
          <ColumnsIcon className="h-4 w-4" />
          <span className="hidden lg:inline">Vista</span>
          <span className="lg:hidden">Columnas</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column) => {
            console.warn({ column });
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitilize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {getColumnTitle(column.columnDef)}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>,
  ];

  useEffect(() => {
    if (update) {
      onResetUpdate();
      reloadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update]);

  async function reloadData() {
    await queryClient.invalidateQueries({ queryKey: ["dataTable"] });
  }

  const handleFilterUpdate = (filters: any) => {
    setAppliedFilters({
      ...appliedFilters,
      ...filters,
    });

    table.setPageIndex(0);
  };

  if (isLoading && !data) {
    return (
      <DataTableSkeleton columns={columns.length} rows={pagination.pageSize} />
    );
  }

  if (isError) {
    return (
      <DataTableError error={error} onRetry={() => table.setPageIndex(0)} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
          {getActionsTable(actionsTable, toolBarConfig)}
        </div>
      </div>
      {showFilters && (
        <DataTableFilter
          key={"filters"}
          dataTableFilter={filters}
          onSearchField={handleFilterUpdate}
        />
      )}
      <div className="space-y-4 md:hidden">
        {table.getRowModel().rows.map((row) => (
          <Card key={row.id}>
            <CardContent className="p-4">
              {row.getVisibleCells().map((cell) => (
                <div key={cell.id} className="mb-2 flex justify-between">
                  <div className="mr-2">
                    {getColumnTitle(cell.column.columnDef)}
                  </div>
                  <div>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="hidden rounded-b border md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {/* Mostrar esqueleto */}
            {isLoading || isFetching ? (
              Array.from({ length: pagination.pageSize }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {Array.from({ length: columns.length }).map(
                    (_, cellIndex) => (
                      <TableCell key={`loading-cell-${cellIndex}`}>
                        <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                return (
                  <TableRow key={`row-${row.id}`}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={`cell-${cell.id}`}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <DataTableEmpty />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <DataTablePagination
        table={table}
        totalItems={data?.datos?.total || 0}
        isLoading={isLoading}
      />
    </div>
  );
}
