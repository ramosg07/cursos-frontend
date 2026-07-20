import { useAuth } from "@/contexts/AuthProvider";

export type Postulante = {
  id: string;
  nroDocumento: string;
  nombres: string;
  primerApellido?: string;
  segundoApellido?: string;
  celular?: string;
  estado: string;
  tipo: "PREFACULTATIVO" | "DISPENSACION" | "OTROS";
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

export type Aula = {
  id: string;
  nombre: string;
  piso: string;
  columnaInicio: string;
  columnaFin: string;
  filas: number;
  capacidad: number;
};

export type Examen = {
  id: string;
  nombre: string;
  fecha: string | null;
  tipo: "PREFACULTATIVO" | "DISPENSACION" | "OTROS";
};

export type AsignacionSorteo = {
  id: string;
  idExamen: string;
  idPostulante: string;
  idAula: string;
  fila: string;
  columna: string;
  fechaSorteo: string;
  postulante: Postulante;
  aula: Aula;
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

    // --- PRODUCTOS ---
    getProductos: async () => {
      const res = await api.sessionRequest<any>({
        url: "/prefas/productos",
        method: "GET",
      });
      return res?.data.datos;
    },
    createProducto: async (data: Partial<ProductoPrefa>) => {
      const res = await api.sessionRequest<any>({
        url: "/prefas/productos",
        method: "POST",
        data,
      });
      return res?.data.datos;
    },
    updateProducto: async (id: string, data: Partial<ProductoPrefa>) => {
      const res = await api.sessionRequest<any>({
        url: `/prefas/productos/${id}`,
        method: "PATCH",
        data,
      });
      return res?.data.datos;
    },

    // SORTEO
    createAula: async (data: Partial<Aula>) => {
      const res = await api.sessionRequest<any>({
        url: "/aulas",
        method: "POST",
        data,
      });
      return res?.data.datos;
    },
    updateAula: async (id: string, data: Partial<Aula>) => {
      const res = await api.sessionRequest<any>({
        url: `/aulas/${id}`,
        method: "PATCH",
        data,
      });
      return res?.data.datos;
    },

    createExamen: async (data: Partial<Examen>) => {
      const res = await api.sessionRequest<any>({
        url: "/examenes",
        method: "POST",
        data,
      });
      return res?.data.datos;
    },
    updateExamen: async (id: string, data: Partial<Examen>) => {
      const res = await api.sessionRequest<any>({
        url: `/examenes/${id}`,
        method: "PATCH",
        data,
      });
      return res?.data.datos;
    },

    realizarSorteo: async (idExamen: string) => {
      const res = await api.sessionRequest<any>({
        url: "/sorteos",
        method: "POST",
        data: { idExamen },
      });
      return res?.data.datos;
    },
    getAsignacionesSorteo: async (idExamen: string) => {
      const res = await api.sessionRequest<any>({
        url: "/sorteos",
        method: "GET",
        params: { idExamen },
      });
      return res?.data.datos as AsignacionSorteo[];
    },
    intercambiarAsignacionesSorteo: async (
      idAsignacionOrigen: string,
      idAsignacionDestino: string,
    ) => {
      const res = await api.sessionRequest<any>({
        url: "/sorteos/intercambiar",
        method: "PATCH",
        data: { idAsignacionOrigen, idAsignacionDestino },
      });
      return res?.data.datos;
    },
    generarPdfAsignacionesSorteo: async (idExamen: string) => {
      const res = await api.sessionRequest<any>({
        url: `/sorteos/pdf`,
        method: "POST",
        responseType: "blob",
        params: { idExamen },
      });
      return res?.data;
    },
  };
};
