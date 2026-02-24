import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableSkeletonProps {
  columns: number;
  rows: number;
}

export function DataTableSkeleton({ columns, rows }: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        {/* Titulo */}
        <Skeleton className="h-9 w-[250px]" />
        {/* Botones */}
        <Skeleton className="h-9 w-[120px]" />
      </div>
      <div className="rounded-md border">
        <Table>
          {/* Encabezado */}
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableHead key={`skeleton-header-${index}`}>
                  <Skeleton className="h-6 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          {/* Cuerpo */}
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={`skeleton-row-${rowIndex}`}>
                {Array.from({ length: columns }).map((_, cellIndex) => (
                  <TableCell key={`skeleton-cell-${rowIndex}-${cellIndex}`}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-[120px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
