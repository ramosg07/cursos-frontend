import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Loader } from "lucide-react";
import { Suspense } from "react";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import { AuthProvider } from "@/contexts/AuthProvider";
import { LoadingProvider } from "@/contexts/LoadingProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LoadingProvider>
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
            </LoadingProvider>
            <Toaster
              position={"top-center"}
              richColors
              closeButton
              toastOptions={{}}
            />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
