import React from 'react'
import { CustomProgressBar } from './CustomProgressBar'

interface PasswordStrengthIndicatorProps {
  strength: number
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  strength,
}) => {
  const getStrengthColor = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500'
      case 2:
      case 3:
        return 'bg-yellow-500'
      case 4:
        return 'bg-green-500'
      default:
        return 'bg-gray-200'
    }
  }

  const getStrengthText = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'Débil'
      case 2:
      case 3:
        return 'Regular'
      case 4:
        return 'Fuerte'
      default:
        return 'Desconocido'
    }
  }

  return (
    <div>
      <CustomProgressBar
        value={(strength / 4) * 100}
        className="mt-2"
        indicatorColor={getStrengthColor(strength)}
      />
      <p className="mt-2 text-sm text-neutral-400" >
        Fortaleza de la contraseña: {getStrengthText(strength)}
      </p>
    </div>
  )
}

export default PasswordStrengthIndicator
