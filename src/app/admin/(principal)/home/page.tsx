import { siteName } from "@/lib/utilities";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Home - ${siteName()}`,
};

export default function AdminHomePage() {
  return <>HOME</>;
}
