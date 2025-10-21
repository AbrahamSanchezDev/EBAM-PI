import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import { NotificationsProvider } from "@/app/lib/notificationsClient";
import Bell from "@/app/ui/bell";
import RequestsMount from "@/app/ui/requests/RequestsMount";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Acme Dashboard",
    default: "Acme Dashboard",
  },
  description: "The official Next.js Learn Dashboard built with App Router.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <NotificationsProvider>
          <div className="w-full bg-white border-b p-3 flex justify-end items-center gap-3">
            <Bell />
            {/* Requests inbox for admins (client component) */}
            <RequestsMount />
          </div>
          {children}
        </NotificationsProvider>
      </body>
    </html>
  );
}
