import { Table } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Loader2Icon,
} from "lucide-react";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalItems: number;
  isLoading?: boolean;
}

export function DataTablePagination<TData>({
  table,
  totalItems,
  isLoading = false,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col-reverse items-center justify-between gap-4 px-2 sm:flex-row">
      <div className="flex-1 text-sm text-muted-foreground">
        <p>Total de registros: {totalItems}</p>
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <div className="flex items-center space-x-2">
          <p className="whitespace-nowrap text-sm font-medium">
            Filas por página
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center text-sm font-medium">
          Página {table.getState().pagination.pageIndex + 1} {" de "}
          {table.getPageCount() || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            <span className="sr-only">Ir a la primera página</span>
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            <span className="sr-only">Ir a la página anterior</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
          >
            <span className="sr-only">Ir a la página siguiente</span>
            {isLoading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage() || isLoading}
          >
            <span className="sr-only">Ir a la última página</span>
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
