// RestablecerContrasenaModal.tsx
import { Usuario } from '../types'
import { useAuth } from '@/contexts/AuthProvider'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MessageInterpreter } from '@/lib/messageInterpreter'
import { print } from '@/lib/print'

interface RestablecerContrasenaModalProps {
  usuario: Usuario | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RestablecerContrasenaModal({
  usuario,
  isOpen,
  onClose,
  onSuccess,
}: RestablecerContrasenaModalProps) {
  const { sessionRequest } = useAuth()

  const handleRestablecer = async () => {
    if (!usuario) return

    try {
      const result = await sessionRequest({
        url: `/usuarios/${usuario.id}/restauracion`,
        method: 'PATCH',
      })
      toast.success('Contraseña restablecida', {
        description: MessageInterpreter(result?.data),
      })
      onSuccess()
    } catch (error) {
      print('Error al restablecer contraseña:', error)
      toast.error('Error', {
        description: MessageInterpreter(error),
      })
    } finally {
      onClose()
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Restablecer contraseña?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Está seguro que desea restablecer la contraseña del usuario{' '}
            {usuario?.usuario}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestablecer}>
            Restablecer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
