'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { Loader } from 'lucide-react'
import { print } from '@/lib/print'

interface LoadingContextType {
  showLoading: (message?: string) => void
  isLoading: boolean
  hideLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsVisible(true)
    } else {
      timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
    }
    return () => clearTimeout(timer)
  }, [isLoading])

  const showLoading = (newMessage?: string) => {
    print(`showLoading: `, isLoading, newMessage)
    setIsLoading(true)
    setMessage(newMessage)
  }

  const hideLoading = () => {
    print(`hideLoading: `, isLoading)
    setIsLoading(false)
  }

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading }}>
      {children}
      {isVisible && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${
            isLoading ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="animate-fade-in">
            <Loader className="h-10 w-10 animate-spin" />
          </div>
          {message && <p className="mt-4 animate-fade-in text-lg">{message}</p>}
        </div>
      )}
    </LoadingContext.Provider>
  )
}
