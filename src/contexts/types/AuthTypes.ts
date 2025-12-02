export interface User {
  id: string
  usuario: string
  correoElectronico: string
  ciudadaniaDigital: boolean
  roles: Role[]
  token: string
  idRol: string
  urlFoto?: string | null
  persona: {
    nombres: string | undefined
    primerApellido: string | undefined
    segundoApellido: string | undefined
    tipoDocumento: string | undefined
    nroDocumento: string | undefined
    fechaNacimiento: string | undefined
    telefono: string | undefined
  }
}

export interface Role {
  idRol: string
  rol: string
  nombre: string
  descripcion: string
  // modulos: Modulo[]
}
