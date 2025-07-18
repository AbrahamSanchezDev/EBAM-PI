"use client";
import { lusitana } from "@/app/ui/fonts";
import { InfoUsuario } from "@/app/ui/perfiles/infoUsuario";

export default function Page(props: {}) {
  // useEffect(() => {
  //   if (!isUserLoggedIn()) {
  //     alert("Por favor, logeate para continuar");
  //     window.location.href = "/";
  //   }
  // }, []);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Perfiles</h1>
      </div>
      <InfoUsuario />
    </div>
  );
}
