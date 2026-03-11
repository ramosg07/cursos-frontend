import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";

import customParseFormat from "dayjs/plugin/customParseFormat";
import { print } from "@/lib/print";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

// Agregar el plugin relativeTime a Dayjs
dayjs.extend(relativeTime);

// Configurar el idioma español como predeterminado en Dayjs
dayjs.locale("es");

export const validateDateFormat = (date: string, format: string) => {
  print(`${date} -> ${dayjs(date).format(format)}`);
  return dayjs(dayjs(date).format(format), format, true).isValid();
};
