export interface Usuario {
  id: string;
  estado: string;
  usuario: string;
  urlFoto: string;
  correoElectronico: string;
  persona: {
    nroDocumento: string;
    nombres: string;
    primerApellido: string;
    segundoApellido: string;
    fechaNacimiento: string;
  };
  usuarioRol: {
    id: string;
    rol: {
      id: string;
      rol: string;
    };
  }[];
}

export interface RolResponse {
  finalizado: boolean
  mensaje: string
  datos: Rol[]
}

export interface Rol {
  id: string;
  rol: string;
  nombre: string;
  descripcion: string;
  estado: string;
}