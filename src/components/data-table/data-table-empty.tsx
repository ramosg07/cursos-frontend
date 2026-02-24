import { FolderOpen } from "lucide-react";

export function DataTableEmpty() {
  return (
    <div className="flex h-24 flex-col items-center justify-center text-center">
      <FolderOpen className="h-8 w-8 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">
        No se encontraron resultados.
      </p>
    </div>
  );
}
