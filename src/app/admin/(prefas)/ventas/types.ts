export interface PostulanteBusqueda {
  id: string;
  nroDocumento: string;
  nombres: string;
  primerApellido: string;
  segundoApellido?: string | null;
  celular: string;
  tipo: string;
}
