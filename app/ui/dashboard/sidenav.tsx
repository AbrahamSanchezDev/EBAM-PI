import Link from "next/link";
import NavLinks from "@/app/ui/dashboard/nav-links";
import AcmeLogo from "@/app/ui/acme-logo";
import { PowerIcon } from "@heroicons/react/24/outline";
import { signOut } from "@/auth";

export default function SideNav() {
  return (
    <div className="flex h-full  flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-25 items-end justify-center rounded-md p-4 md:h-50"
        href="/"
      >
        {/* Responsive: logo a la izquierda del nombre en móvil, en columna en md+ */}
        <div className="w-40 text-black md:w-50 flex flex-row md:flex-col justify-center items-center">
          <img
            src="/logo 2.png"
            alt="Logo EBAM"
            className="h-12 w-12 md:h-20 md:w-20 mr-2 md:mb-2 md:mr-0"
          />
          <p
            className="text-[28px] md:text-[44px] font-extrabold"
            style={{
              fontFamily: " Sono, sans-serif",
              fontWeight: 800,
            }}
          >
            EBAM
          </p>
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks
          activeClassName="!bg-[#eaf1fa] !text-[#1d4a7a] !font-semibold"
          iconClassName="text-[#1d4a7a]"
        />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form
          action={async () => {
            "use server";
            try {
              await signOut({ redirectTo: "/" });
            } catch (error) {
              console.error("Error during sign out:", error);
              // throw new Error("Failed to sign out. Please try again.");
            }
          }}
        >
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
