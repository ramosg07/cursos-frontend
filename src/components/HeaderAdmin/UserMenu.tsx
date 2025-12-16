import { User } from "@/contexts/types/AuthTypes";
import { Button } from "../ui/button";
import { Laptop, LogOut, Moon, Shield, Sun } from "lucide-react";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Constants } from "@/config/Constants";
import { capitalizeFirstLetter } from "@/lib/utilities";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

interface UserMenuProps {
  user?: User | null;
  getInitials: () => string;
  handleLogout: () => void;
  handleRoleChange: (idRol: string) => void
}

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  getInitials,
  handleLogout,
  handleRoleChange
}) => {
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar>
            {user?.urlFoto && (
              <Image
                src={`${Constants.baseUrl}${user.urlFoto}`}
                alt={"Foto de perfil"}
                fill
                sizes="100vw"
                style={{
                  objectFit: "cover",
                }}
              />
            )}
            <AvatarFallback className="text-1xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 gap-1" align="end" forceMount>
        {/* USUARIO LOGUEADO */}
        <DropdownMenuItem
          className="font-normal"
          onClick={() => {
            router.push("/admin/perfil");
          }}
        >
          <div className="flex flex-row items-center justify-start gap-2">
            <Avatar>
              {user?.urlFoto && (
                <Image
                  src={`${Constants.baseUrl}${user.urlFoto}`}
                  alt={"Foto de perfil"}
                  fill
                  sizes="100vw"
                  style={{
                    objectFit: "cover",
                  }}
                />
              )}
              <AvatarFallback className="text-1xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-">
              <p className="text-sm font-medium">
                {capitalizeFirstLetter(user?.persona?.nombres ?? "")}{" "}
                {capitalizeFirstLetter(
                  user?.persona?.primerApellido ??
                    user?.persona.segundoApellido ??
                    ""
                )}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.usuario}
              </p>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* TEMA DE LA APLICACION */}
        <DropdownMenuLabel>Tema</DropdownMenuLabel>
        <Tabs value={theme} onValueChange={setTheme} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="light" className="flex items-center">
              <Sun className="mr-2 h-4 w-4" />
              Claro
            </TabsTrigger>
            <TabsTrigger value="dark" className="flex items-center">
              <Moon className="mr-2 h-4 w-4" />
              Oscuro
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center">
              <Laptop className="mr-2 h-4 w-4" />
              Sistema
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <DropdownMenuSeparator />
        {/* ROLES DEL USUARIO */}
        <DropdownMenuLabel>Roles</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={user?.idRol}
          onValueChange={handleRoleChange}
        >
          {user?.roles?.map((role) => (
            <DropdownMenuRadioItem
              key={role.idRol}
              value={role.idRol}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>{role.nombre}</span>
              </div>
              <Badge
                variant={user?.idRol === role.idRol ? "default" : "outline"}
                className="ml-2"
              >
                {user?.idRol === role.idRol ? "Activo" : "Inactivo"}
              </Badge>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        {/* CERRAR SESION */}
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4 text-red-600" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
