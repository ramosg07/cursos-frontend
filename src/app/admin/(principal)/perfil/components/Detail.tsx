"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthProvider";
import { Cake, Camera, Contact, Mail, Phone, Shield, User } from "lucide-react";
import dayjs from "dayjs";
import { nombrePropio } from "@/lib/utilities";
import { Badge } from "@/components/ui/badge";
import DynamicIcon from "../../../../../components/Icon";
import Image from "next/image";
import { Constants } from "@/config/Constants";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const Detail = () => {
  const { user } = useAuth();
  const [avatarKey, setAvatarKey] = useState(0);

  useEffect(() => {
    // Forzar la actualización del avatar cuando cambie la URL de la foto
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvatarKey((prevKey) => prevKey + 1);
  }, [user?.urlFoto]);

  if (!user) {
    return null;
  }

  if (!user) {
    return <div>Cargando perfil...</div>;
  }

  const obtenerRolActual = () => {
    const actual = user.roles.find((role) => role.idRol === user.idRol);
    return actual?.rol || "";
  };

  const getInitials = () => {
    if (user.persona) {
      const { nombres, primerApellido, segundoApellido } = user.persona;
      const inicialNombre = nombres ? nombres[0] : "";
      const inicialPrimerApellido = primerApellido
        ? primerApellido[0]
        : undefined;
      const inicialSegundoApellido = segundoApellido
        ? segundoApellido[0]
        : undefined;
      const inicialApellidos =
        inicialPrimerApellido ?? inicialSegundoApellido ?? "";
      return `${inicialNombre}${inicialApellidos}`;
    }
    return "";
  };

  return (
    <div className="container mx-auto py-6 xl:px-30 space-y-5">
      <h1 className="text-2xl font-bold">Perfil de usuario</h1>
      {/* TODO: Mosrar ruta del perfil:  Dashboard > Perfil, para la navegación */}
      <Card className="p-0 overflow-hidden rounded-2xl gap-11 sm:gap-3">
        <div className="relative h-50 w-full">
          <img
            src="https://images.unsplash.com/photo-1522199710521-72d69614c702"
            className="h-full w-full object-cover"
          />
          <div className="absolute -bottom-9 left-6 flex justify-between items-center gap-3">
            <div className="relative">
              <Avatar className="h-25 w-25 sm:h-30 sm:w-30">
                {user?.urlFoto && (
                  <Image
                    key={avatarKey}
                    src={`${Constants.baseUrl}${user.urlFoto}`}
                    alt={"Foto de perfil"}
                    fill
                    sizes="100vw"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                )}
                <AvatarFallback className="text-3xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full"
                // onClick={() => setIsPhotoDialogOpen(true)}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-white">
              <h2 className="text-lg sm:text-2xl font-bold">
                {nombrePropio(
                  `${user.persona?.nombres} ${user.persona?.primerApellido} ${
                    user.persona?.segundoApellido || ""
                  }`
                )}
              </h2>
              <p className="text-sm font-semibold">{obtenerRolActual()}</p>
            </div>
          </div>
        </div>
        <div className="px-6 pb-2">
          <nav className="flex justify-end gap-6 text-sm">
            <button className="flex items-center gap-2 pb-2 border-b-2 border-white">
              <User size={16} /> Perfil
            </button>
            {/* <button className="flex items-center gap-2 pb-2 opacity-70 hover:opacity-100">
              <Heart size={16} /> Cursos
            </button>
            <button className="flex items-center gap-2 pb-2 opacity-70 hover:opacity-100">
              <Users size={16} /> Certificados
            </button> */}
          </nav>
        </div>
      </Card>
      <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-10 mt-10">
        <Card className="gap-2 relative p-4">
          <CardHeader className="-mt-10">
            <Card className="py-3 px-4 w-fit">
              <CardTitle>Datos personales</CardTitle>
            </Card>
          </CardHeader>
          <CardContent className="-mt-4">
            <div className="mt-4 flex items-center">
              <Contact className="mr-2" />
              <div>
                {user.persona.tipoDocumento} {user.persona.nroDocumento}
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Cake className="mr-2" />
              <div>
                {dayjs(user.persona.fechaNacimiento).format("DD/MM/YYYY")}
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Mail className="mr-2" />
              <div>{user.correoElectronico}</div>
            </div>
            <div className="mt-4 flex items-center">
              <Phone className="mr-2" />
              <div>{user.persona.telefono ?? "No disponible"}</div>
            </div>
            {/* <div className="mt-4 flex items-center">
              <VenusAndMars className="mr-2" />
              <div>{user.persona.genero ?? "No disponible"}</div>
            </div> */}
          </CardContent>
        </Card>
        <Card className="gap-2 relative p-4 ">
          <CardHeader className="-mt-10">
            <Card className="py-3 px-4 w-fit">
              <CardTitle>Roles</CardTitle>
            </Card>
          </CardHeader>
          <CardContent className="max-h-none overflow-visible lg:max-h-40 lg:overflow-y-auto">
            <div className="space-y-4">
              {user.roles.map((role) => (
                <div
                  key={role.idRol}
                  className="flex items-center justify-between rounded-lg"
                  onClick={async () => {
                    // await handleRoleChange(role.idRol);
                  }}
                >
                  <div className="flex items-center">
                    <Shield className="mr-2" />
                    <div>
                      <h3 className="font-semibold">{role.nombre}</h3>
                    </div>
                  </div>
                  <Badge
                    variant={user.idRol === role.idRol ? "default" : "outline"}
                  >
                    {user.idRol === role.idRol ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="gap-2 relative p-4 mt-10">
        <CardHeader className="-mt-10">
          <Card className="py-3 px-4 w-fit">
            <CardTitle>Módulos</CardTitle>
          </Card>
        </CardHeader>
        <CardContent className="">
          <div className="space-y-4 grid grid-cols-1">
            {user.roles
              .find((r) => r.idRol === user.idRol)
              ?.modulos.map((modulo) => (
                <div
                  key={modulo.id}
                  className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800"
                >
                  <h3 className="font-semibold">{modulo.label}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {modulo.propiedades.descripcion}
                  </p>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {modulo.subModulo.map((subModulo) => (
                      <div
                        key={subModulo.id}
                        className="rounded bg-white p-2 dark:bg-gray-700"
                        onClick={() => {
                          // router.push(subModulo.url);
                        }}
                      >
                        <div className={"flex items-center"}>
                          <DynamicIcon
                            name={subModulo.propiedades.icono}
                            size={24}
                            className="m-3 ml-2"
                          />
                          <div>
                            <div>
                              <span className={"font-semibold"}>
                                {subModulo.label}
                              </span>
                            </div>
                            <div>
                              <span className={"text-sm text-gray-500"}>
                                {subModulo.propiedades.descripcion}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Detail;

// mb-6 text-2xl font-bold
