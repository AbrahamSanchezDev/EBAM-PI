"use client";
import React, { useEffect, useState } from "react";
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
  const computeFeatures = (detail?: any) => {
    // if event provided a detail object (updated profile), prefer that
    if (detail && detail.features) return detail.features;
    const profileFeatures = profile?.features || null;
    const persistedFeatures = typeof window !== "undefined" ? getCurrentUserFeatures() : null;
    return profileFeatures || persistedFeatures || null;
  };

  const [activeFeatures, setActiveFeatures] = React.useState<string[] | null>(computeFeatures());

  // keep features in sync when profile changes (initial fetch)
  React.useEffect(() => {
    setActiveFeatures(computeFeatures());
  }, [profile]);

  // Listen for userChanged events (from SSE) to recompute features immediately
  React.useEffect(() => {
    const handler = (ev?: any) => {
      try {
        const detail = ev?.detail;
        setActiveFeatures(computeFeatures(detail));
      } catch (e) {
        setActiveFeatures(computeFeatures());
      }
    };
    window.addEventListener("userChanged", handler);
    return () => window.removeEventListener("userChanged", handler);
  }, []);

  const links = activeFeatures ? ALL_LINKS.filter((l) => activeFeatures.includes(l.feature)) : ALL_LINKS;

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
