import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthProvider";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Loader2,
  Search,
  Trash2,
  Undo2,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PostulanteBusqueda } from "../types";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { ProductoPrefa } from "../../services/prefas.api";
import { print } from "@/lib/print";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

export function Venta() {
  const { sessionRequest } = useAuth();

  // Estado para postulante
  const [nroDocumento, setNroDocumento] = useState("");
  const [loadingPostulante, setLoadingPostulante] = useState(false);
  const [postulante, setPostulante] = useState<PostulanteBusqueda | null>(null);

  // Estado para productos y seleccion
  const [productos, setProductos] = useState<ProductoPrefa[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoPrefa | null>(null);
  const [cantidad, setCantidad] = useState(1);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [procesando, setProcesando] = useState(false);
  const [exito, setExito] = useState(false);

  // IDs de las compras creadas (para el recibo)
  const [idVenta, setIdVenta] = useState<string | null>(null);
  const [generandoRecibo, setGenerandoRecibo] = useState(false);

  // Bandeja de Ventas (Carrito)
  const [carrito, setCarrito] = useState<
    {
      producto: ProductoPrefa;
      cantidad: number;
      error?: boolean;
      mensajeError?: string;
    }[]
  >([]);

  const handleSearchPostulante = async () => {
    if (!nroDocumento.trim()) return;
    setLoadingPostulante(true);
    setPostulante(null);
    try {
      const response = await sessionRequest<{
        finalizado: boolean;
        datos: PostulanteBusqueda;
      }>({
        url: `prefas/postulantes/${nroDocumento}/buscar`,
        method: "GET",
      });
      if (response && response.data.datos) {
        setPostulante(response.data.datos);
      }
    } catch (error: any) {
      toast.error(error?.message || "Postulante no encontrado");
    } finally {
      setLoadingPostulante(false);
    }
  };

  const reset = () => {
    setNroDocumento("");
    setPostulante(null);
    setCarrito([]);
    setProductoSeleccionado(null);
    setCantidad(1);
    setProductos([]);
    setExito(false);
    setIdVenta(null);
  };

  const fetchProductos = useCallback(
    async (filtro: string, limite = 20) => {
      setLoadingProductos(true);
      try {
        const response = await sessionRequest<any>({
          url: "/prefas/productos",
          method: "GET",
          params: { filtro: filtro ? filtro : undefined, limite },
        });
        if (response && response.data?.datos?.filas) {
          setProductos(response.data.datos.filas);
        }
      } catch (error) {
        print("Error fetching productos", error);
      } finally {
        setLoadingProductos(false);
      }
    },
    [sessionRequest],
  );

  const handleBusquedaProducto = useCallback(
    (valor: string) => {
      if (!valor.trim()) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        fetchProductos("", 10);
        return;
      }
      const hayCoincidenciaLocal = productos.some((p) =>
        p.nombre.toLowerCase().includes(valor.toLowerCase()),
      );
      if (hayCoincidenciaLocal) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchProductos(valor, 20);
      }, 350);
    },
    [productos, fetchProductos],
  );

  const agregarAlCarrito = () => {
    if (carrito.length >= 10) {
      toast.error("El carrito no puede tener más de 10 productos");
      return;
    }

    const producto = productoSeleccionado;
    if (!producto) {
      toast.error("Seleccione un producto válido");
      return;
    }

    // Evitar duplicados de curso
    if (carrito.find((item) => item.producto.id === producto.id)) {
      toast.error(
        "El estudiante ya está comprando en este producto en esta sesión",
      );
      return;
    }

    // Limpiar errores previos al agregar (se re-validará en el useEffect)
    setCarrito([...carrito, { producto, cantidad, error: false }]);
    setCantidad(1);
  };

  const quitarDelCarrito = (index: number) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };

  console.log("carrito", carrito);

  const totalMonto = carrito.reduce((acc, item) => {
    const monto = item.producto.precio * item.cantidad;
    return acc + Number(monto || 0);
  }, 0);

  const validarCarrito = useCallback(async () => {
    if (!postulante || carrito.length === 0) return;

    try {
      const response = await sessionRequest<{
        datos: { idProducto: string; mensaje: string }[];
      }>({
        url: "/ventas/multiple/validar",
        method: "post",
        data: {
          idPostulante: postulante.id,
          detalles: carrito.map((item) => ({
            idProducto: item.producto.id,
            cantidad: item.cantidad,
          })),
        },
      });

      if (response && response.data) {
        const errores = response.data.datos || [];
        setCarrito((prev) =>
          prev.map((item) => {
            const errorEncontrado = errores.find(
              (e) => e.idProducto === item.producto.id,
            );
            return {
              ...item,
              error: !!errorEncontrado,
              mensajeError: errorEncontrado?.mensaje,
            };
          }),
        );
      }
    } catch (error) {
      print("Error validando carrito", error);
    }
  }, [postulante, carrito, sessionRequest]);

  const handleFinalizarInscripcion = async () => {
    if (!postulante) return;
    if (carrito.length === 0) {
      toast.error("La bandeja de compras está vacía");
      return;
    }

    setProcesando(true);
    try {
      // Limpiar errores previos antes de intentar procesar
      setCarrito((prev) => prev.map((item) => ({ ...item, error: false })));

      const response = await sessionRequest<{ datos: any[] }>({
        url: "/ventas/multiple",
        method: "post",
        data: {
          idPostulante: postulante.id,
          detalles: carrito.map((item) => ({
            idProducto: item.producto.id,
            cantidad: item.cantidad,
          })),
        },
      });

      // Extraer IDs de las inscripciones creadas para el recibo
      const venta: any = response?.data?.datos || [];
      setIdVenta(venta.id);

      toast.success("Comprado correctamente todos los productos");
      setExito(true);
    } catch (error: any) {
      const body = error?.response?.data || error;
      const mensajeGeneral =
        body?.message || body?.mensaje || "Error al procesar la compra";
      const erroresMasivos = body?.errores || []; // Lista de errores del backend

      toast.error(mensajeGeneral);

      if (erroresMasivos.length > 0) {
        // Marcamos todos los productos que fallaron usando la lista del backend
        setCarrito((prev) =>
          prev.map((item) => {
            const conflict = erroresMasivos.find(
              (e: any) => e.idProducto === item.producto.id,
            );
            if (conflict) {
              return { ...item, error: true, mensajeError: conflict.mensaje };
            }
            return { ...item, error: false, mensajeError: undefined };
          }),
        );
      } else {
        // Fallback para errores individuales o no estructurados
        const idProductoError = error?.idProducto;
        setCarrito((prev) =>
          prev.map((item) => {
            if (idProductoError && item.producto.id === idProductoError) {
              return { ...item, error: true, mensajeError: mensajeGeneral };
            }
            if (
              !idProductoError &&
              typeof mensajeGeneral === "string" &&
              mensajeGeneral.includes(item.producto.nombre)
            ) {
              return { ...item, error: true, mensajeError: mensajeGeneral };
            }
            return item;
          }),
        );
      }
    } finally {
      setProcesando(false);
    }
  };

  const downloadReceipt = async () => {
    if (!idVenta) return;
    setGenerandoRecibo(true);
    try {
      const response = await sessionRequest<Blob>({
        url: "/ventas/multiple/recibo",
        method: "post",
        data: {
          idVenta: idVenta,
        },
        responseType: "blob",
      });

      if (response && response.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `recibo-inscripcion-${new Date().getTime()}.pdf`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Recibo generado correctamente");
      }
    } catch (error) {
      print("Error generating receipt", error);
      toast.error("Error al generar el recibo PDF");
    } finally {
      setGenerandoRecibo(false);
    }
  };

  useEffect(() => {
    if (postulante) fetchProductos("", 10);
  }, [postulante, fetchProductos]);

  useEffect(() => {
    validarCarrito();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postulante, carrito.length]);

  if (exito) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in zoom-in duration-500 px-4">
        <div className="relative">
          <div className="h-25 w-25 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center ring-8 ring-green-50 dark:ring-green-900/10">
            <CheckCircle2 className="h-12 w-12 text-green-600 animate-pulse" />
          </div>
          <div className="absolute -top-2 -right-2 h-10 w-10 bg-white dark:bg-slate-900 rounded-full shadow-lg flex items-center justify-center border-4 border-green-500">
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent pb-1">
            ¡Venta Completada!
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-lg">
            El postulante{" "}
            <span className="font-bold text-foreground text-primary">
              {postulante?.nombres} {postulante?.primerApellido}
            </span>{" "}
            ha comprado correctamente {carrito.length} productos .
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button
            onClick={downloadReceipt}
            disabled={generandoRecibo}
            className="flex-1 h-12 font-bold gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform"
            size="lg"
          >
            {generandoRecibo ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Download className="h-6 w-6" />
            )}
            Descargar Recibo
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            className="flex-1 h-12 font-bold gap-3 border-2"
            size="lg"
          >
            <UserPlus className="h-6 w-6" />
            Nueva Inscripción
          </Button>
        </div>

        <Card className="w-full max-w-md border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center text-md mb-4 text-muted-foreground tracking-wider font-bold">
              <span>Producto</span>
              <span>Precio</span>
              <span>Cantidad</span>
              <span>Total</span>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-3">
              {carrito.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center gap-2"
                >
                  <div className="text-left min-w-0">
                    <p className="font-bold text-sm truncate">
                      {item.producto.nombre}
                    </p>
                  </div>
                  <span className="font-mono font-bold whitespace-nowrap">
                    Bs. {item.producto.precio}
                  </span>
                  <span className="font-mono font-bold whitespace-nowrap">
                    {item.producto.stock}
                  </span>
                  <span className="font-mono font-bold whitespace-nowrap">
                    {item.producto.precio * item.cantidad}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center">
              <span className="font-black text-lg">TOTAL PAGADO</span>
              <span className="text-2xl font-black text-primary">
                Bs. {totalMonto.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border-2 border-primary/10 shadow-xl shadow-primary/5 bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="bg-primary/5 border-b border-primary/10 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-black">
                Paso 1: Postulante
              </CardTitle>
              <CardDescription className="text-base">
                Verificación de identidad del postulante
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pt-2 pb-8">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 w-full space-y-3">
              <label className="text-sm font-black text-muted-foreground ml-1">
                Documento de Identidad (CI)
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Ej. 8457214"
                  value={nroDocumento}
                  onChange={(e) => setNroDocumento(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSearchPostulante()
                  }
                  className="h-10 pl-12 text-lg font-bold bg-muted/50 border-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
            <Button
              onClick={handleSearchPostulante}
              disabled={loadingPostulante || !nroDocumento}
              className="h-10 px-10 text-lg font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
              size="lg"
            >
              {loadingPostulante ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  Buscar Persona <Search className="h-5 w-5" />
                </div>
              )}
            </Button>
          </div>

          {postulante && (
            <div className="mt-8 p-6 rounded-3xl border-2 border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-6">
                <div className="h-13 w-13 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-primary/20">
                  {postulante.nombres[0]}
                </div>
                <div>
                  <p className="font-black text-xl">
                    {postulante.nombres} {postulante.primerApellido}{" "}
                    {postulante.segundoApellido}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <Badge
                      variant="outline"
                      className="font-bold border-primary/30"
                    >
                      CI: {postulante.nroDocumento}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => reset()}
                className="text-muted-foreground hover:text-destructive font-black text-xs uppercase tracking-widest gap-2"
              >
                <Undo2 className="h-4 w-4" /> Cambiar Persona
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      {postulante && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-700">
          <Card className="h-fit border-2 border-primary/5 shadow-xl shadow-primary/5 flex flex-col overflow-hidden gap-4">
            <CardHeader className="bg-card px-8 pt-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-black">
                  Paso 2: Selección de Productos
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              {/* Combobox de Productos */}
              <div className="space-y-3">
                <label className="text-[14px] font-black text-muted-foreground ml-1">
                  Producto
                </label>
                <Combobox
                  items={productos.map((p) => p.nombre)}
                  value={productoSeleccionado?.nombre ?? ""}
                  onValueChange={(nombre) => {
                    const producto = productos.find((p) => p.nombre === nombre);
                    if (producto) {
                      setProductoSeleccionado(producto);
                      // setIdCursoSeleccionado(producto.id);
                    } else {
                      setProductoSeleccionado(null);
                      // setIdCursoSeleccionado("");
                    }
                  }}
                >
                  <ComboboxInput
                    placeholder="Buscar producto por nombre..."
                    showClear={!!productoSeleccionado}
                    onChange={(e) => {
                      handleBusquedaProducto(e.target.value);
                      if (!e.target.value) {
                        setProductoSeleccionado(null);
                        // setIdCursoSeleccionado("");
                      }
                    }}
                    className="w-full h-14 text-base font-bold bg-muted/30 border-2"
                  />
                  <ComboboxContent>
                    {loadingProductos ? (
                      <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Buscando...
                      </div>
                    ) : (
                      <>
                        <ComboboxEmpty>
                          No se encontraron productos.
                        </ComboboxEmpty>
                        <ComboboxList>
                          {(nombre) => {
                            const producto = productos.find(
                              (p) => p.nombre === nombre,
                            );
                            return (
                              <ComboboxItem key={nombre} value={nombre}>
                                <span className="font-bold flex-1">
                                  {nombre}
                                </span>
                                {producto && (
                                  <span className="text-primary font-bold text-sm ml-auto">
                                    Bs. {producto.precio}
                                  </span>
                                )}
                              </ComboboxItem>
                            );
                          }}
                        </ComboboxList>
                      </>
                    )}
                  </ComboboxContent>
                </Combobox>
              </div>

              {/* Cantidad de productos */}
              {productoSeleccionado &&
                productoSeleccionado.tipo === "PRODUCTO" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="text-[14px] font-black text-muted-foreground ml-1">
                      Cantidad
                    </label>
                    <div className="relative mt-2">
                      <Input
                        type="number"
                        placeholder="Ej. 12"
                        value={cantidad}
                        onChange={(e) => {
                          setCantidad(Number(e.target.value) || 1);
                        }}
                        className="h-10 pl-5 text-lg font-bold bg-muted/50 border-2 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

              <Button
                className="w-full h-14 text-lg font-black shadow-lg shadow-primary/10 active:scale-95 transition-all"
                disabled={!productoSeleccionado}
                onClick={agregarAlCarrito}
              >
                Agregar a la bandeja <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* SECCIÓN 3: BANDEJA (CARRITO) */}
          <Card className="md:row-span-2 border-2 border-primary/5 shadow-2xl flex flex-col overflow-hidden bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="bg-card px-8 pt-8 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-black">
                    Paso 3: Bandeja
                  </CardTitle>
                </div>
                <div className="h-8 px-3 rounded-lg bg-primary text-white  text-[10px] font-black flex items-center gap-2">
                  {carrito.length}
                  {carrito.length === 1 ? " ITEM" : " ITEMS"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="flex-1 overflow-auto min-h-[300px]">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent border-0">
                      <TableHead className="pl-8 text-[12px] font-black h-12 normal-case">
                        Producto
                      </TableHead>
                      <TableHead className="text-right text-[12px] font-black h-12 normal-case">
                        Precio
                      </TableHead>
                      <TableHead className="text-right text-[12px] font-black h-12 normal-case">
                        Cantidad
                      </TableHead>
                      <TableHead className="text-right text-[12px] font-black h-12 normal-case">
                        Importe
                      </TableHead>
                      <TableHead className="w-[80px] h-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carrito.length === 0 ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={3} className="h-64 text-center">
                          <div className="flex flex-col items-center gap-4 text-muted-foreground/40">
                            <BookOpen className="h-12 w-12 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest">
                              Bandeja Vacía
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      carrito.map((item, index) => (
                        <TableRow
                          key={index}
                          className={`hover:bg-primary/5 transition-colors border-primary/5 group ${
                            item.error
                              ? "bg-destructive/10 border-destructive/50"
                              : ""
                          }`}
                        >
                          <TableCell className="pl-8 py-5">
                            <div className="flex items-center gap-2">
                              {item.error && (
                                <Badge
                                  variant="destructive"
                                  className="h-5 w-5 p-0 flex items-center justify-center rounded-full"
                                >
                                  !
                                </Badge>
                              )}
                              <div>
                                <p
                                  className={`font-black text-base transition-color breajk-words whitespace-normal  ${
                                    item.error
                                      ? "text-destructive"
                                      : "text-foreground group-hover:text-primary"
                                  }`}
                                >
                                  {item.producto.nombre}
                                </p>
                                <p
                                  className={`text-xs font-bold uppercase tracking-widest mt-1 wrap-break-word whitespace-normal ${
                                    item.error
                                      ? "text-destructive/80"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {item.error ? item.mensajeError : ``}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-black text-base py-5">
                            Bs. {item.producto.precio}
                          </TableCell>
                          <TableCell className="text-right font-mono font-black text-base py-5">
                            {item.cantidad}
                          </TableCell>
                          <TableCell className="text-right font-mono font-black text-base py-5">
                            Bs. {item.producto.precio * item.cantidad}
                          </TableCell>
                          <TableCell className="pr-6 py-5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => quitarDelCarrito(index)}
                              className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="p-8 space-y-8 bg-card border-t border-primary/5 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-black text-muted-foreground">
                      Total Liquidación
                    </span>
                    <span className="text-lg font-black text-foreground">
                      BOLIVIANOS
                    </span>
                  </div>
                  <span className="text-5xl font-black text-primary tracking-tighter">
                    Bs. {totalMonto.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full h-14 text-xl font-black shadow-2xl shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all gap-4"
                    disabled={carrito.length === 0 || procesando}
                    onClick={handleFinalizarInscripcion}
                  >
                    {procesando ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <>
                        <FileText className="h-8 w-8" />
                        Finalizar y cobrar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
