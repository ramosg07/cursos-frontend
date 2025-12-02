import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Loader } from "lucide-react";
import { Suspense } from "react";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import { AuthProvider } from "@/contexts/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cursos frontend",
  description: "Creado con NextJS y Tailwind",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <Suspense
                fallback={
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
                    <div className="animate-fade-in">
                      <Loader className="h-10 w-10 animate-spin" />
                    </div>
                  </div>
                }
              >
                {children}
              </Suspense>
            </AuthProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
