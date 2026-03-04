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
    usuario: {
      id: string;
      usuario: string;
      correoElectronico: string;
      persona: {
        id: string;
        nombres: string;
        primerApellido: string;
        segundoApellido?: string | null;
        nroDocumento: string;
      };
    };
  };
}

export interface EstudianteBusqueda {
  id: string;
  codigoPersonal?: string | null;
  usuario: {
    id: string;
    usuario: string;
    correoElectronico: string;
    persona: {
      id: string;
      nombres: string;
      primerApellido: string;
      segundoApellido?: string | null;
      nroDocumento: string;
    };
  };
}
