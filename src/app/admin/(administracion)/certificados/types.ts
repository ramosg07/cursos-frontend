export interface PlantillaCertificado {
  id: string;
  nombre: string;
  fondoUrl?: string;
  orientacion: "HORIZONTAL" | "VERTICAL";
  configuracion?: CertificadoConfig;
  estado: string;
}

export interface CertificadoConfig {
  canvasSize: { width: number; height: number };
  campos: CertificadoCampo[];
  fondo: boolean;
}

export interface CertificadoCampo {
  id: string;
  tipo: "texto";
  valor: string; // Etiqueta (Nombre, Curso, etc)
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  align: "left" | "center" | "right";
  draggable: boolean;
  width?: number;
  scaleX?: number;
  scaleY?: number;
  variable?: string;
  testValue?: string;
}

export interface PlantillaCertificadoResponse {
  finalizado: boolean;
  mensaje: string;
  datos: PlantillaCertificado[];
}
