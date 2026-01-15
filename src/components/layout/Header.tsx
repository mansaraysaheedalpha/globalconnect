// src/components/layout/Header.tsx
"use client";

import React from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { useMutation, useQuery } from "@apollo/client";
import { GET_MY_ORGS_QUERY } from "@/graphql/queries";
import { LOGOUT_MUTATION, TEAM_DATA_QUERY } from "../features/Auth/auth.graphql";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "../ui/user-avatar";
import Link from "next/link";
import { Globe, Menu } from "lucide-react";
import { NotificationBellOnly } from "@/components/features/notifications/notifications-container";
import { HeaderDMButton } from "@/components/features/dm";

type HeaderProps = {
  onOpenSidebar?: () => void;
};

export function Header({ onOpenSidebar }: HeaderProps) {
  const { user, orgId, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { data, loading } = useQuery(GET_MY_ORGS_QUERY);

  // Extract eventId from pathname if on an event page
  const eventIdMatch = pathname.match(/\/dashboard\/events\/([^/]+)/);
  const eventId = eventIdMatch ? eventIdMatch[1] : undefined;
  const { data: teamData } = useQuery(TEAM_DATA_QUERY);
  const currentOrg = data?.myOrganizations.find((org: any) => org.id === orgId);

  const currentUserRole = teamData?.organizationMembers?.find(
    (member: any) => member.user.id === user?.id
  )?.role?.name;

  // Transform team members to availableUsers format for DM feature
  const availableUsers = React.useMemo(() => {
    if (!teamData?.organizationMembers) return [];
    return teamData.organizationMembers.map((member: any) => ({
      id: member.user.id,
      firstName: member.user.first_name,
      lastName: member.user.last_name,
      avatar: member.user.imageUrl,
    }));
  }, [teamData?.organizationMembers]);

  const [logoutUser] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      logout();
      router.push("/auth/login");
    },
    onError: () => {
      logout();
      router.push("/auth/login");
    },
  });

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => onOpenSidebar?.()}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 min-w-0">
          <div className="font-semibold text-base sm:text-lg truncate max-w-[150px] sm:max-w-none">
            {loading ? "..." : currentOrg?.name || "Organization"}
          </div>
          <div>
            <OrganizationSwitcher />
          </div>
        </div>
      </div>

      {user ? (
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Direct Messages */}
          <HeaderDMButton availableUsers={availableUsers} />

          {/* Notifications Bell */}
          <NotificationBellOnly eventId={eventId} />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3">
              <UserAvatar
                firstName={user.first_name}
                lastName={user.last_name}
                imageUrl={user.imageUrl}
              />
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium">
                  {[user.first_name, user.last_name].filter(Boolean).join(" ")}
                </p>
                <p className="text-xs text-muted-foreground">{currentUserRole || "Member"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/settings/profile">
              <DropdownMenuItem>Profile</DropdownMenuItem>
            </Link>
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <DropdownMenuItem>
                <Globe className="h-4 w-4 mr-2" />
                View Public Site
              </DropdownMenuItem>
            </Link>
            <Link href="/settings/security">
              <DropdownMenuItem>Security</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logoutUser()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
      )}
    </header>
  );
}