export interface Usuario {
  id: string;
  estado: string;
  usuario: string;
  urlFoto: string;
  persona: {
    nroDocumento: string;
    nombres: string;
    primerApellido: string;
    segundoApellido: string;
  };
  usuarioRol: {
    id: string;
    rol: {
      id: string;
      rol: string;
    };
  }[];
}
