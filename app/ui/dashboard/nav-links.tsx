"use client";
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  GlobeAmericasIcon,
  WrenchScrewdriverIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: "Calendario", href: "/dashboard", icon: HomeIcon },
  {
    name: "Perfiles",
    href: "/dashboard/perfiles",
    icon: IdentificationIcon,
  },
  { name: "Mapas", href: "/dashboard/mapas", icon: GlobeAmericasIcon },
  {
    name: "Configuracion",
    href: "/dashboard/consultas",
    icon: WrenchScrewdriverIcon,
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-[#eaf1fa] hover:text-[#1d4a7a] md:flex-none md:justify-start md:p-2 md:px-3",
              {
                "!bg-[#eaf1fa] !text-[#1d4a7a] !font-semibold":
                  pathname === link.href,
              }
            )}
          >
            <LinkIcon
              className={clsx("w-6", pathname === link.href ? "text-[#1d4a7a]" : "")}
            />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
