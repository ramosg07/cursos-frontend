export interface Inscripcion {
  id: string;
  idEstudiante: string;
  idCurso: string;
  idParalelo: string;
  fechaInscripcion: string;
  estado: string;
  paralelo: {
    id: string;
    nombre: string;
  };
  estudiante: {
    id: string;
    codigoPersonal?: string | null;
    usuario: Usuario;
  };
  usuarioInscripcion: Usuario;
  usuarioDesinscripcion: Usuario;
}

export interface EstudianteBusqueda {
  id: string;
  codigoPersonal?: string | null;
  usuario: Usuario;
}

interface Persona {
  id: string;
  nombres: string;
  primerApellido: string;
  segundoApellido?: string | null;
  nroDocumento: string;
}

interface Usuario {
  id: string;
  usuario: string;
  correoElectronico: string;
  persona: Persona;
}
