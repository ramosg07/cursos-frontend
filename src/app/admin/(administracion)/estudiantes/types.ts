export interface Estudiante {
  id: string;
  codigoPersonal?: string | null;
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
    };
  };
}

export interface CrearEstudianteDto {
  nroDocumento: string;
  nombres: string;
  primerApellido: string;
  segundoApellido?: string | null;
  correoElectronico: string;
  fechaNacimiento?: string | null;
  codigoPersonal?: string | null;
}

export interface ActualizarEstudianteDto extends Partial<CrearEstudianteDto> {}
