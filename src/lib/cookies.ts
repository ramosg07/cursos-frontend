import Cookies from 'js-cookie'
import { print } from '@/lib/print'

export const guardarCookie = (
  key: string,
  value: string,
  options?: Cookies.CookieAttributes
) => {
  Cookies.set(key, value, {
    secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === 'true',
    sameSite: 'strict',
    ...options,
  })
  print(`🍪 ✅`, key, value)
}

export const leerCookie = (key: string): string | undefined => {
  return Cookies.get(key)
}

export const eliminarCookie = (key: string) => {
  print(`🍪 🗑`, key)
  return Cookies.remove(key)
}

export const eliminarCookies = () => {
  Object.keys(Cookies.get()).forEach((cookieName) => {
    print(`🍪 🗑`, cookieName)
    Cookies.remove(cookieName)
  })
}
