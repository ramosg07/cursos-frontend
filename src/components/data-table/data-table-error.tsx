import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";

interface DataTableErrorProps {
  error: any;
  onRetry: () => void;
}

export function DataTableError({ error, onRetry }: DataTableErrorProps) {
  return (
    <Alert variant={"destructive"} className="my-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error al cargar los datos</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>
          {error?.message ||
            "Ha ocurrido un error al cargar los datos de la tabla"}
        </p>
        <Button
          variant={"outline"}
          size={"sm"}
          className="w-fit"
          onClick={onRetry}
        >
          Reintentar
        </Button>
      </AlertDescription>
    </Alert>
  );
}
