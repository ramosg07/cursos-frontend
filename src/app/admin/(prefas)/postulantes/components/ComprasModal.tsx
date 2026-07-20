import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Postulante } from "../../services/prefas.api";
import { History, Loader2, PackageSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { print } from "@/lib/print";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Props {
  postulante: Postulante | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ComprasModal({ postulante, isOpen, onClose }: Props) {
  const { sessionRequest } = useAuth();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    if (!isOpen || !postulante?.id) return;

    const fetchHistorial = async () => {
      setLoading(true);
      try {
        const response = await sessionRequest<any>({
          url: `/ventas/${postulante?.nroDocumento}`,
          method: "GET",
        });
        if (response?.data?.datos) {
          setData(response.data?.datos);
        }
      } catch (error) {
        print("Error al cargar historial de compras", error);
        toast.error("Error al cargar el historial de compras");
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [isOpen, postulante, sessionRequest]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[860px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Historial de compras
            </DialogTitle>
            {postulante && (
              <p className="text-sm text-muted-foreground pt-1">
                {postulante.nombres} {postulante.primerApellido ?? ""}
              </p>
            )}
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Cargando compras...
              </span>
            </div>
          ) : !data || data.totalImpresiones === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <PackageSearch className="h-10 w-10 opacity-30" />
              <p className="text-sm text-center">
                Este postulante aun no ha comprado ningun producto
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto pr-1">
              {/* Tabla de inscripciones del recibo */}
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-black text-xs uppercase tracking-widest pl-6">
                      Producto
                    </TableHead>
                    <TableHead className="font-black text-xs uppercase tracking-widest pl-6">
                      Precio
                    </TableHead>
                    <TableHead className="font-black text-xs uppercase tracking-widest pl-6">
                      Cantidad
                    </TableHead>
                    <TableHead className="font-black text-xs uppercase tracking-widest text-right pr-6">
                      Monto
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.flatMap((compra: any) =>
                    compra.detalles.map((vent: any) => (
                      <TableRow
                        key={vent.id}
                        className="hover:bg-primary/5 transition-colors group"
                      >
                        <TableCell className="py-4 pl-6">
                          <div>
                            <p className="font-black text-sm group-hover:text-primary transition-colors line-clamp-1">
                              {vent.producto?.nombre}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 pl-6">
                          <div>
                            <p className="font-black text-sm group-hover:text-primary transition-colors line-clamp-1">
                              {vent.precioUnitario}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 pl-6">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                              {vent.cantidad}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4 pr-6">
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-black text-base text-primary">
                              Bs. {vent.subtotal}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[9px] h-4 py-0 font-bold border-green-500/30 text-green-600 bg-green-500/5"
                            >
                              PAGADO
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    )),
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
