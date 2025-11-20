import "@/app/ui/global.css";
// react-big-calendar global styles must be imported from a top-level entry (app layout)
import "react-big-calendar/lib/css/react-big-calendar.css";
import { inter } from "@/app/ui/fonts";
import { NotificationsProvider } from "@/app/lib/notificationsClient";
import HeaderActions from "@/app/ui/header-actions";
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
            <HeaderActions />
          </div>
          {children}
        </NotificationsProvider>
      </body>
    </html>
  );
}
