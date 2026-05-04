export interface Docente {
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
      fechaNacimiento?: string | null;
    };
  };
}

export interface CrearDocenteDto {
  nroDocumento: string;
  nombres: string;
  primerApellido: string;
  segundoApellido?: string | null;
  correoElectronico: string;
  fechaNacimiento?: string | null;
  codigoPersonal?: string | null;
}

export interface ActualizarDocenteDto extends Partial<CrearDocenteDto> { }
