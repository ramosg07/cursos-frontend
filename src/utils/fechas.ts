import dayjs from "dayjs";

export const validarFechaFormato = (date: string, format: string) => {
  return dayjs(dayjs(date).format(format), format, true).isValid();
};

export const formatoFecha = (date: string, format: string): string=> {
  return dayjs(date).format(format);
};