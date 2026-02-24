export interface FilterType {
  type: string;
  name: string;
  value: string | string[];
  list?: {
    code: string;
    description: string;
  }[];
  label: string;
  clearable?: boolean;
  visible?: boolean;
  handleOnChange?: (value: any) => void;
}

export interface FilterDataTableType {
  dataTableFilter: FilterType[];
  onSearchField: (filters: FilterType[]) => void;
}