import { Metadata } from "next";
import { lusitana } from "@/app/ui/fonts";

export const metadata: Metadata = {
  title: "mapas",
};

export default function Page() {
  return (
    <main>
      <h1>Contenido para mapa</h1>
      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14941.057266420454!2d-101.22196181090382!3d20.57726076827774!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842c85c965f8dd99%3A0xf0c50b96a2552383!2sTechnological%20University%20of%20Salamanca!5e0!3m2!1sen!2smx!4v1755181579589!5m2!1sen!2smx" width="600" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
      
    </main>
  );
}
