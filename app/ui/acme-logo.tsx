import Image from "next/image";
import { lusitana } from "@/app/ui/fonts";

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-col justify-center items-center leading-none  text-center`}
    >
      <Image src="/logo 2.png" alt="Logo EBAM" width={80} height={80} className="h-20 w-20 mb-2 mx-auto" />
      <p className="text-[44px] w-full">EBAM</p>
    </div>
  );
}
