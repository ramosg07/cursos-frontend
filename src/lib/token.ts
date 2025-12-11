import { decodeToken } from 'react-jwt'
import { print } from '@/lib/print'

export const verificarToken = (token: string): boolean => {
  const myDecodedToken: any = decodeToken(token)
  const caducidad = new Date(myDecodedToken.exp * 1000)

  print(`Token 🔐 : expira en ${caducidad}`)

  return new Date().getTime() - caducidad.getTime() < 0
}
