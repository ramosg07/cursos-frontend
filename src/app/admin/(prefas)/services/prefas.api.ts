import { useAuth } from "@/contexts/AuthProvider";

export type Postulante = {
  id: string;
  nroDocumento: string;
  nombres: string;
  primerApellido?: string;
  segundoApellido?: string;
  celular?: string;
  estado: string;
};

export type ProductoPrefa = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  tipo: "CURSO" | "PRODUCTO";
};

export type VentaRequest = {
  idPostulante: string;
  detalles: {
    idProducto: string;
    cantidad: number;
  }[];
};

export const usePrefasApi = () => {
  const api = useAuth();

  return {
    // --- POSTULANTES ---
    getPostulantes: async () => {
      const res = await api.sessionRequest<any>({
        url: "/prefas/postulantes",
        method: "GET",
      });
      return res?.data.datos;
    },
    createPostulante: async (data: Partial<Postulante>) => {
      const res = await api.sessionRequest<any>({
        url: "/prefas/postulantes",
        method: "POST",
        data,
      });
      return res?.data.datos;
    },
    updatePostulante: async (id: string, data: Partial<Postulante>) => {
      const res = await api.sessionRequest<any>({
        url: `/prefas/postulantes/${id}`,
        method: "PATCH",
        data,
      });
      return res?.data.datos;
    },
  };
};
