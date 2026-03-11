"use client";
import { es } from "react-day-picker/locale";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FieldLabel, FieldError } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayjs from "dayjs";

type DatePickerProps = {
  value?: string;
  onChange: (date?: string) => void;
  label?: string;
  error?: any;
  invalid?: boolean;
};

export function DatePickerSimple({
  value,
  onChange,
  label = "Fecha",
  error,
  invalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <FieldLabel>{label}</FieldLabel>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start font-normal w-full"
            aria-invalid={invalid}
          >
            {value
              ? dayjs.utc(value, "YYYY-MM-DD").format("DD/MM/YYYY")
              : "Seleccione una fecha"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? dayjs(value, "YYYY-MM-DD").toDate() : undefined}
            defaultMonth={
              value ? dayjs(value, "YYYY-MM-DD").toDate() : undefined
            }
            captionLayout="dropdown"
            onSelect={(date) => {
              if (date) onChange(dayjs(date).format("YYYY-MM-DD"));
              setOpen(false);
            }}
            locale={es}
          />
        </PopoverContent>
      </Popover>
      {invalid && <FieldError errors={[error]} />}
    </>
  );
}
