import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "../ui/button";

export function SortableHeader({
  column,
  title,
}: {
  column: any;
  title: string;
}) {
  return (
    <Button
      variant={"ghost"}
      onClick={() => {
        const currentSortingState = column.getIsSorted();
        if (currentSortingState === false) {
          column.toggleSorting(true);
        } else if (currentSortingState === "desc") {
          column.toggleSorting(false);
        } else {
          column.toggleSorting();
        }
      }}
    >
      {title}
      <span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDown className="h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : null}
      </span>
    </Button>
  );
}
