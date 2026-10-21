import { siteName } from "@/lib/utilities";
import { Metadata } from "next";
import { Configuracion } from "./components/Configuracion";

export const metadata: Metadata = {
  title: `Configuracion - ${siteName()}`,
};

export default function AdminConfigPage() {
  return (
    <div className="container p-1">
        <Configuracion />
    </div>
  );
}
