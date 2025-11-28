'use client'
import HeaderLogin from "@/components/HeaderLogin";
import { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderLogin />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </>
  );
}
