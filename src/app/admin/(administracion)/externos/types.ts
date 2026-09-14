export interface Externo {
  id: string;
  estado: string;
  usuario: {
    id: string;
    usuario: string;
    correoElectronico: string;
    estado: string;
    persona: {
      nombres: string;
      primerApellido: string;
      segundoApellido?: string | null;
      nroDocumento: string;
      fechaNacimiento?: string | null;
      telefono?: string | null;
    };
  };
}
