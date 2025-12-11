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

interface LogoutDialogProps {
  showLogoutDialog: boolean
  setShowLogoutDialog: (show: boolean) => void
  confirmLogout: () => void
}

export const LogoutDialog: React.FC<LogoutDialogProps> = ({
  showLogoutDialog,
  setShowLogoutDialog,
  confirmLogout,
}) => (
  <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          ¿Estás seguro de que quieres cerrar sesión?
        </AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción cerrará tu sesión actual. Tendrás que volver a iniciar
          sesión para acceder nuevamente.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={confirmLogout}>
          Cerrar sesión
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
