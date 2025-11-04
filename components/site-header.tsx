"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

function getTitle(pathname: string | null): string {
  if (!pathname) return "Dashboard";
  if (pathname === "/" || pathname === "") return "Home";
  if (
    pathname.startsWith("/admin/events/") &&
    pathname.endsWith("/attendees")
  ) {
    const id = pathname.split("/")[3] || "";
    return `Event ${id} Attendees`;
  }
  const map: Record<string, string> = {
    "/admin": "Admin Dashboard",
    "/admin/reservations": "Reservations",
    "/admin/organizers/create": "Create Organizer",
    "/admin/events/create": "Create Event",
    "/organizer/scan": "Organizer Scan",
    "/organizer/login": "Organizer Login",
    "/admin/login": "Admin Login",
    "/game/spin": "Spin Game",
  };
  return map[pathname] ?? "Dashboard";
}

export function SiteHeader() {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const [logoSrc, setLogoSrc] = React.useState("/act-dev-logo.png");

  return (
    <header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <Separator
          orientation='vertical'
          className='mx-2 data-[orientation=vertical]:h-4'
        />
        <div className='flex items-center gap-2'>
          <Image
            src={logoSrc}
            alt='ACT DEV Community Logo'
            width={28}
            height={28}
            className='rounded'
            onError={() => setLogoSrc("/globe.svg")}
            priority
          />
          <h1 className='text-base font-semibold'>{title}</h1>
        </div>
        <div className='ml-auto flex items-center gap-2'></div>
      </div>
    </header>
  );
}
