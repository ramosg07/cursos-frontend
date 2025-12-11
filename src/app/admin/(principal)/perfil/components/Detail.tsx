"use client";

import { useAuth } from "@/contexts/AuthProvider";

const Detail = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Cargando perfil...</div>;
  }

  return (
    <div className="container mx-auto py-6 px-30">
      <h1 className="mb-6 text-2xl font-bold">Perfil de usuario</h1>
      {/* TODO: Mosrar ruta del perfil:  Dashboard > Perfil, para la navegación */}
      <div className="grid grid-cols-1 gap-6">
        {/* aquiiiiiiii */}
        <div className="relative isolate overflow-hidden bg-gray-800 px-6 pt-16 after:pointer-events-none after:absolute after:inset-0 after:inset-ring after:inset-ring-white/10 sm:rounded-3xl sm:px-16 after:sm:rounded-3xl md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -z-10 size-256 -translate-y-1/2 mask-[radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
          >
            <circle
              r="512"
              cx="512"
              cy="512"
              fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
              fillOpacity="0.7"
            />
            <defs>
              <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                <stop stopColor="#7775D4" />
                <stop offset="1" stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-10 lg:text-left">
            <p className="font-semibold tracking-tight text-balance text-white">
              Juan Perez
            </p>
            <p className="mt-6 text-lg/8 text-pretty text-gray-300">
              Ac euismod vel sit maecenas id pellentesque eu sed consectetur.
              Malesuada adipiscing sagittis vel nulla.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <a
                href="#"
                className="rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white inset-ring inset-ring-white/5 hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {" "}
                Get started{" "}
              </a>
              <a
                href="#"
                className="text-sm/6 font-semibold text-white hover:text-gray-100"
              >
                Learn more
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;

// mb-6 text-2xl font-bold
