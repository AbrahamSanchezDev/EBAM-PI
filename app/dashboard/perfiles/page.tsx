import { lusitana } from "@/app/ui/fonts";
import { Metadata } from "next";
import RFIDReader from "@/app/esp32/RFIDReader";

export const metadata: Metadata = {
  title: "Perfiles",
};

export default async function Page(props: {}) {
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Perfiles</h1>
      </div>

      <RFIDReader />
    </div>
  );
}
