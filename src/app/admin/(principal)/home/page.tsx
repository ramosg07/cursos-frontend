import { siteName } from "@/lib/utilities";
import { Metadata } from "next";
import Dashboard from "./components/Dashboard";

export const metadata: Metadata = {
  title: `Home - ${siteName()}`,
};

export default function AdminHomePage() {
  return (
    <div className="container p-1">
      <Dashboard />
    </div>
  );
}
