import {
  ColumnDef,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";
import { FilterType } from "./filter";

export interface ToolBarConfigType {
  showSearch?: boolean;
  showRefresh?: boolean;
  showColumns?: boolean;
  components?: React.ReactNode[];
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  filters?: FilterType[];
  apiUrl: string;
  defaultSorting?: SortingState;
  toolBarConfig?: ToolBarConfigType;

  titulo: string;
  subtitulo?: string;
  update: boolean;
  onResetUpdate: () => void;
  params?: Record<string, any>;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  onSelectedItemsChange?: (items: TData[]) => void;
}
