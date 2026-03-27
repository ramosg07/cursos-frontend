"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { FilterDataTableType, FilterType } from "./types/filter";
import { Field } from "../ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Check, ChevronDown, FileSearch2, Search } from "lucide-react";
import { Badge } from "../ui/badge";
import { Command, CommandInput, CommandItem } from "../ui/command";
import { CommandEmpty, CommandGroup, CommandList } from "cmdk";
import { cn } from "@/lib/utils";
import { formatoFecha, validarFechaFormato } from "@/utils/fechas";
import { useDebouncedCallback } from "use-debounce";

export const DataTableFilter = ({
  dataTableFilter,
  onSearchField,
}: FilterDataTableType) => {
  let filterValues: any = {};
  dataTableFilter.forEach((filter) => {
    Object.assign(filterValues, { [filter.name]: filter.value });
  });

  const form = useForm<any>({
    defaultValues: filterValues,
  });

	const watchedValues = form.watch();

  const filterValuesController: any = {};
  const filterControllersList: any = [];

  dataTableFilter.forEach((filter) => {
    filterValuesController[filter.name] = form.watch(filter.name);
    filterControllersList.push(form.watch(filter.name));
  });

  const debounced = useDebouncedCallback((filters: any) => {
    const auxFilters: any = { ...filters };
    dataTableFilter.forEach((filter: FilterType) => {
      if (filter.type === "date") {
        auxFilters[filter.name] = validarFechaFormato(
          auxFilters[filter.name],
          "YYYY-MM-DD"
        )
          ? formatoFecha(auxFilters[filter.name], "YYYY-MM-DD")
          : "";
      }

      if (filter.type === "multi-select") {
        const auxSelectValue =
          Array.isArray(filters[filter.name]) && filters[filter.name].length > 0
            ? filters[filter.name]
            : [];
        auxFilters[filter.name] = auxSelectValue.join();
      }

    });
    onSearchField(auxFilters);
  }, 1000);

  const updateFilters = (filters: any) => {
    debounced(filters);
  };

  useEffect(() => {
    updateFilters(watchedValues);
  }, [watchedValues]);

  function FilterElement(filter: FilterType) {
    let auxElem: ReactNode;
    const listData = filter.list || [];
    const [openSelect, setOpenSelect] = useState(false);

    const [openMultiSelect, setOpenMultiSelect] = useState(false);
    const [selectedValues, setSelectedValues] = useState<string[]>(
      Array.isArray(filter.value) && filter.value.length > 0 ? filter.value : []
    );
    const [searchQuery, setSearchQuery] = useState("");

    const handleSelect = (value: string, name: string) => {
      const newData: string[] = ((prev: any) =>
        prev.includes(value)
          ? prev.filter((item: string) => item !== value)
          : [...prev, value])(selectedValues);
      setSelectedValues(newData);
      form.setValue(name, newData);
    };

    const clearFilters = (name: string) => {
      setSelectedValues([]);
      setOpenMultiSelect(false);
      form.setValue(name, []);
    };

    const SearchFilter = (
      dataFilter: {
        code: string;
        description: string;
      }[] = []
    ) => {
      const filteredPriorities = useMemo(() => {
        if (!searchQuery) return dataFilter;

        const nomalizedQuery = searchQuery.toLowerCase().trim();

        return dataFilter.filter((item) => {
          if (item.description.toLowerCase().includes(nomalizedQuery))
            return true;

          if (item.code.toLowerCase().includes(nomalizedQuery)) return true;

          const queryWords = nomalizedQuery.split(/\s+/);
          return queryWords.some((word) => {
            return (
              item.description.toLowerCase().includes(word) ||
              item.code.toLowerCase().includes(word)
            );
          });
        });
      }, [searchQuery]);

      return filteredPriorities;
    };

    switch (filter.type) {
      case "list":
        auxElem = (
          <div key={filter.name + "-list"}>
            {(filter.visible === undefined || filter.visible === true) && (
              <Controller
                name={filter.name + "field"}
                control={form.control}
                render={({ field }) => {
                  return (
                    <Field className="w-full bg-background">
                      <Popover
                        key={"popoverComponent"}
                        open={openMultiSelect}
                        onOpenChange={setOpenMultiSelect}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role={"combobox"}
                            aria-expanded={openSelect}
                            className="justify-between"
                          >
                            {filterValuesController[filter.name] &&
                            filterValuesController[filter.name] !== "" ? (
                              listData.find(
                                (item) =>
                                  item.code ===
                                  filterValuesController[filter.name]
                              )?.description
                            ) : filter.value && filter.value !== "" ? (
                              listData.find(
                                (item) => item.code === filter.value
                              )?.description
                            ) : (
                              <span className="opacity-50">{filter.label}</span>
                            )}
                            <ChevronDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Buscar datos..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No se encontró datos.</CommandEmpty>
                              <CommandGroup>
                                {listData.map((dataSelect) => (
                                  <CommandItem
                                    key={dataSelect.code}
                                    {...field}
                                    value={dataSelect.code}
                                    onSelect={(currentValue) => {
                                      form.setValue(filter.name, currentValue);
                                      setOpenSelect(false);
                                    }}
                                  >
                                    {dataSelect.description}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        filterValuesController[filter.name] ===
                                          dataSelect.code
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              <div className="border-t p-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-center"
                                  onClick={() => {
                                    form.setValue(filter.name, "");
                                    setOpenSelect(false);
                                  }}
                                >
                                  Limpiar filtros
                                </Button>
                              </div>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </Field>
                  );
                }}
              />
            )}
          </div>
        );
        break;
      // case "date":
      //   break;
      case "multi-select":
        auxElem = (
          <div key={filter.name + "-multi-select"}>
            {(filter.visible === undefined || filter.visible === true) && (
              <Controller
                name={filter.name + "field"}
                control={form.control}
                render={({ field }) => {
                  return (
                    <Field className="w-full bg-background">
                      <Popover
                        key={"popoverComponent"}
                        open={openMultiSelect}
                        onOpenChange={setOpenMultiSelect}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role={"combobox"}
                            aria-expanded={openMultiSelect}
                            className="w-full justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Search className="h-4 w-4 shrink-0 opacity-50" />
                              <span className="opacity-50">{field.value}</span>
                              {selectedValues.length > 0 && (
                                <Badge
                                  variant={"secondary"}
                                  className="rounded-sm px-1 font-normal"
                                >
                                  {selectedValues.length}
                                </Badge>
                              )}
                            </div>
                            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder={filter.name}
                              className="h-9"
                              value={searchQuery}
                              onValueChange={setSearchQuery}
                            />
                            <CommandList>
                              {SearchFilter(filter.list).length === 0 ? (
                                <CommandEmpty>
                                  No se encontró datos.
                                </CommandEmpty>
                              ) : (
                                <CommandGroup>
                                  {SearchFilter(filter.list).map((item) => {
                                    const isSelected = selectedValues.includes(
                                      item.code
                                    );
                                    const Icon = FileSearch2;
                                    return (
                                      <CommandItem
                                        className="flex items-center gap-2"
                                        key={item.code}
                                        {...field}
                                        onSelect={() =>
                                          handleSelect(item.code, filter.name)
                                        }
                                      >
                                        <div
                                          className={cn(
                                            "flex items-center  justify-center w-4 h-4 border rounded",
                                            isSelected
                                              ? "border-primary"
                                              : "border-input"
                                          )}
                                        >
                                          {isSelected && (
                                            <Check className="w-4 h-4 text-muted-foreground" />
                                          )}
                                        </div>
                                        <Icon className="w-4 h-4 text-muted-foreground" />
                                        <span>{item.description}</span>
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              )}
                              <div className="border-t p-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-center"
                                  onClick={() => {
                                    clearFilters(filter.name);
                                  }}
                                >
                                  Limpiar filtros
                                </Button>
                              </div>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </Field>
                  );
                }}
              />
            )}
          </div>
        );
        break;
      default: // text
        auxElem = (
          <div key={filter.name + "-text"}>
            {(filter.visible === undefined || filter.visible === true) && (
              <Controller
                name={filter.name + "field"}
                control={form.control}
                render={({ field }) => {
                  return (
                    <Field className="w-full bg-background">
                      <Input
                        {...field}
                        id={filter.name}
                        placeholder={filter.label}
                        defaultValue={filter.value}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          form.setValue(filter.name, event.target.value);
                        }}
                      />
                    </Field>
                  );
                }}
              />
            )}
          </div>
        );
    }

    return auxElem;
  }

  return (
    <div>
      <form className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
        {dataTableFilter.map((e) => FilterElement(e))}
      </form>
    </div>
  );
};
