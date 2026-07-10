"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { Venta } from "./components/Venta";
import { Consulta } from "./components/Consulta";

export default function NuevaVentaPage() {
  const [activeTab, setActiveTab] = useState("registro");

  return (
    <div className="space-y-8 container py-5 px-2 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent pb-1">
            Gestión de Ventas
          </h1>
          <p className="text-muted-foreground">
            Sistema de registro y consulta de ventas.
          </p>
        </div>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <TabsList className="bg-muted/50 p-1 h-12 border-2 border-primary/5">
          <TabsTrigger
            value="registro"
            className="px-8 font-black text-xs uppercase tracking-widest gap-2"
          >
            <UserPlus className="h-4 w-4" /> Nueva Venta
          </TabsTrigger>
          <TabsTrigger
            value="consulta"
            className="px-8 font-black text-xs uppercase tracking-widest gap-2"
          >
            <Search className="h-4 w-4" /> Consultar por CI
          </TabsTrigger>
        </TabsList>
        <TabsContent value="registro" className="space-y-8 mt-0 border-0 p-0">
          <Venta />
        </TabsContent>
        <TabsContent value="consulta" className="space-y-8 mt-0 border-0 p-0">
          <Consulta />
        </TabsContent>
      </Tabs>
    </div>
  );
}
