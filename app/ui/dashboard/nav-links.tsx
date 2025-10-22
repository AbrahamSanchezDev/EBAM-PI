"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useCurrentUserProfile, getCurrentUserFeatures } from "@/app/lib/userState";
import { ALL_LINKS } from "@/app/lib/featureFlags";
type NavLinksProps = {
  activeClassName?: string;
  iconClassName?: string;
};

export default function NavLinks({ activeClassName, iconClassName }: NavLinksProps) {
  const pathname = usePathname();
  const profile = useCurrentUserProfile();

  // Features can come from persisted localStorage (set at login) or from profile fetched
  const persistedFeatures = typeof window !== "undefined" ? getCurrentUserFeatures() : null;
  const profileFeatures = profile?.features || null;
  const features = profileFeatures || persistedFeatures || null;

  // If features are null, default to showing all links (safe for initial UX)
  const links = features
    ? ALL_LINKS.filter((l) => features.includes(l.feature))
    : ALL_LINKS;

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
                [activeClassName || "!bg-[#eaf1fa] !text-[#1d4a7a] !font-semibold"]: pathname === link.href,
              }
            )}
          >
            <LinkIcon className={clsx("w-6", iconClassName || "", pathname === link.href ? "text-[#1d4a7a]" : "")} />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
