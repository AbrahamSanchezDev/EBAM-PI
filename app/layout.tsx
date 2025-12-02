
import HeaderActionsWrapper from "@/app/ui/dashboard/HeaderActionsWrapper";
import "@/app/ui/global.css";
// react-big-calendar global styles must be imported from a top-level entry (app layout)
import "react-big-calendar/lib/css/react-big-calendar.css";
import { inter } from "@/app/ui/fonts";
import { NotificationsProvider } from "@/app/lib/notificationsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Acme Dashboard",
    default: "Acme Dashboard",
  },
  description: "The official Next.js Learn Dashboard built with App Router.",
  metadataBase: new URL("https://next-learn-dashboard.vercel.sh"),
};
function LayoutWithHeader({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="w-full">
          <NotificationsProvider>
            {/** HeaderActionsWrapper es cliente y decide si mostrar los iconos */}
            {typeof window === "undefined" ? null : <HeaderActionsWrapper />}
            {children}
          </NotificationsProvider>
        </div>
      </body>
    </html>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="w-full
        ">
          <NotificationsProvider>
            <HeaderActionsWrapper />
            {children}
          </NotificationsProvider>
        </div>
      </body>
    </html>
  );
}
