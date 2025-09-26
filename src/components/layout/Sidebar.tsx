// src/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
// --- CHANGE: Importing Heroicons instead of Lucide ---
import {
  Squares2X2Icon,
  UsersIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  CalendarDaysIcon,
  MapPinIcon,
  MicrophoneIcon,
  BookOpenIcon,
  ArrowLeftOnRectangleIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/store/auth.store";

export function Sidebar({
  onOpenCreateOrgModal,
}: {
  onOpenCreateOrgModal: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  // --- CHANGE: Swapped icons to Heroicons ---
  const navLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Squares2X2Icon,
    },
    {
      href: "/dashboard/events",
      label: "Events",
      icon: CalendarDaysIcon,
    },
    {
      href: "/speakers",
      label: "Speakers",
      icon: MicrophoneIcon,
    },
    {
      href: "/venues",
      label: "Venues",
      icon: MapPinIcon,
    },
    {
      href: "/dashboard/blueprints",
      label: "Blueprints",
      icon: BookOpenIcon,
    },
    {
      href: "/team",
      label: "Team",
      icon: UsersIcon,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Cog6ToothIcon,
    },
  ];

  return (
    // --- CHANGE: Added `dark` class to force the navy background and light text ---
    <aside className="dark w-64 flex-shrink-0 bg-background text-foreground border-r border-border/50 p-4 flex flex-col">
      <div className="mb-8 p-2">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="GlobalConnect Logo"
            width={36}
            height={36}
          />
          <span className="text-xl font-bold text-foreground">
            GlobalConnect
          </span>
        </Link>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/dashboard"
              ? pathname === link.href
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                // --- CHANGE: Adjusted text colors for better contrast on the dark background ---
                "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground/70 transition-all hover:text-foreground hover:bg-white/5",
                isActive &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-4">
        <Button
          className="w-full justify-start gap-3"
          variant="secondary"
          onClick={onOpenCreateOrgModal}
        >
          <PlusCircleIcon className="h-5 w-5" />
          Create Organization
        </Button>
      </div>
    </aside>
  );
}
