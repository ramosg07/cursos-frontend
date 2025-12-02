import { Constants } from "@/config/Constants";

export const print = (...mensaje: any[]) => {
  mensaje = mensaje.filter((value) => value != undefined || value != null);
  const entorno = Constants.appEnv;

  if (entorno != "production") {
    console.log(`🖨 `, ...mensaje);
  }
};
