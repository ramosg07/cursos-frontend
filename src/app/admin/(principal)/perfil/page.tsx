import { siteName } from "@/lib/utilities";
import { Metadata } from "next";
import Detail from "./components/Detail";

export const metadata: Metadata = {
  title: `Perfil - ${siteName()}`,
};

export default function ProfilePage() {
  return <Detail />;
}
