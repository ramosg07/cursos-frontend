import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@base-ui/react";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";

export function Consulta() {

  // Estado para Consulta por CI
	const [ciConsulta, setCiConsulta] = useState("");
  const [loadingConsulta, setLoadingConsulta] = useState(false);


  return (
    <>
      <Card className="overflow-hidden border-2 border-primary/10 shadow-xl shadow-primary/5 bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="bg-primary/5 border-b border-primary/10 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-black">
                Consultar Historial
              </CardTitle>
              <CardDescription className="text-base">
                Verifique los productos comprados.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pt-8 pb-8">
          <div className="flex flex-col md:flex-row items-end gap-4 max-w-2xl">
            <div className="flex-1 w-full space-y-3">
              <label className="text-sm font-black text-muted-foreground ml-1">
                Documento de Identidad (CI)
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Ingrese CI para consultar..."
                  value={ciConsulta}
                  onChange={(e) => setCiConsulta(e.target.value)}
                  // onKeyDown={(e) =>
                  //   e.key === "Enter" && handleConsultaInscripciones()
                  // }
                  className="h-14 pl-12 text-lg font-bold bg-muted/50 border-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
            <Button
              // onClick={handleConsultaInscripciones}
              disabled={loadingConsulta || !ciConsulta}
              className="h-14 px-10 text-lg font-black shadow-lg shadow-accent/20 active:scale-95 transition-all"
              size="lg"
            >
              {loadingConsulta ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "Consultar"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
