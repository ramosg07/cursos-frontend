export interface Curso {
  id: string;
  nombre: string;
  descripcion?: string | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  monto: number;
  estado: string;
  cursoCoordinador: CursoCoordinador[];
  paralelos: Paralelo[];
  idPlantillaCertificado?: string | null;
}

export interface Paralelo {
  id: string;
  nombre: string;
  cupo: number;
  estado: string;
  inscritos?: number;
  cuposDisponibles?: number;
}

export interface CursoCoordinador {
  id: string;
  idUsuario: string;
  estado: string;
  usuario: {
    id: string;
    usuario: string;
    correoElectronico?: string;
    persona: {
      nombres: string;
      primerApellido: string;
      segundoApellido?: string;
    };
  };
}

export interface UsuarioCoordinador {
  id: string;
  usuario: string;
  correoElectronico?: string;
  estado: string;
  persona: {
    nombres: string;
    primerApellido: string;
    segundoApellido?: string;
    nroDocumento: string;
  };
}
