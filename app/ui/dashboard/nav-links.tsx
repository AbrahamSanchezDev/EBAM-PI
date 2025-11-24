"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useCurrentUserProfile, getCurrentUserFeatures } from "@/app/lib/userState";
import { ALL_LINKS, FEATURES } from "@/app/lib/featureFlags";
type NavLinksProps = {
  activeClassName?: string;
  iconClassName?: string;
};

export default function NavLinks({ activeClassName, iconClassName }: NavLinksProps) {
  const pathname = usePathname();
  const profile = useCurrentUserProfile();
  // Don't read client-only storage during render — compute features after mount to avoid
  // hydration mismatches. Initial render (server and first client pass) will show ALL_LINKS.
  const [activeFeatures, setActiveFeatures] = useState<string[] | null>(null);

  useEffect(() => {
    const computeFeatures = (detail?: any) => {
      // prefer features provided by event detail
      if (detail && detail.features) return detail.features;
      const profileFeatures = profile?.features || null;
      // persisted features from localStorage are only available in browser
      const persistedFeatures = typeof window !== "undefined" ? getCurrentUserFeatures() : null;
      return profileFeatures || persistedFeatures || null;
    };

    // initial computation after mount
    setActiveFeatures(computeFeatures());

    // Listen for userChanged events (from SSE) to recompute features immediately
    const handler = (ev?: any) => {
      try {
        const detail = ev?.detail;
        setActiveFeatures(computeFeatures(detail));
      } catch (e) {
        setActiveFeatures(computeFeatures());
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("userChanged", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("userChanged", handler);
      }
    };
  }, [profile]);

  const links = activeFeatures ? ALL_LINKS.filter((l) => activeFeatures.includes(l.feature)) : ALL_LINKS;

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        // Show text on mobile for Perfil and Perfiles, keep other links compact
        const showTextOnMobile = link.feature === FEATURES.PERFIL || link.feature === FEATURES.PERFILES;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              // base layout: allow mobile items to either center (icons-only) or left-align when showing text
              "flex h-[48px] grow items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-[#eaf1fa] hover:text-[#1d4a7a] md:flex-none md:p-2 md:px-3",
              {
                // center icons on mobile when text hidden
                "justify-center": !showTextOnMobile,
                // left-align when showing text on mobile
                "justify-start": showTextOnMobile,
                [activeClassName || "!bg-[#eaf1fa] !text-[#1d4a7a] !font-semibold"]: pathname === link.href,
              }
            )}
          >
            <LinkIcon className={clsx("w-6", iconClassName || "", pathname === link.href ? "text-[#1d4a7a]" : "")} />
            <p className={clsx(showTextOnMobile ? "block" : "hidden md:block")}>{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
