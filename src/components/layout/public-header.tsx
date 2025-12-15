// src/components/layout/public-header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { useAuthStore } from "@/store/auth.store";
import { LOGOUT_MUTATION } from "@/components/features/Auth/auth.graphql";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import { Menu, X, LayoutDashboard, LogOut, User } from "lucide-react";

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, orgId, logout } = useAuthStore();
  const router = useRouter();

  const [logoutUser] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      logout();
      router.push("/");
    },
    onError: () => {
      logout();
      router.push("/");
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoSrc = "/logo.png";
  const isLoggedIn = !!user;
  const isOrganizer = !!orgId;
  const dashboardPath = isOrganizer ? "/dashboard" : "/attendee";

  const navLinks = [
    { href: "/events", label: "Events" },
    { href: "#features", label: "Features" },
  ];

  return (
    <>
      {/* Top gradient overlay for better header visibility */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 h-32 pointer-events-none z-40 transition-opacity duration-300",
          "bg-gradient-to-b from-black/60 via-black/30 to-transparent",
          scrolled && "opacity-0"
        )}
      />

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 dark:bg-background/95 backdrop-blur-md border-b shadow-sm"
            : "bg-black/20 backdrop-blur-sm border-b border-white/10"
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={logoSrc}
              alt="GlobalConnect Logo"
              width={32}
              height={32}
              className={cn(
                "transition-all",
                !scrolled && "drop-shadow-lg"
              )}
            />
            <span
              className={cn(
                "text-xl font-bold transition-colors",
                scrolled
                  ? "text-foreground"
                  : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              )}
            >
              GlobalConnect
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  scrolled
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-white/90 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {/* Dashboard button - Desktop */}
                <Button
                  variant={scrolled ? "ghost" : "secondary"}
                  size="sm"
                  asChild
                  className={cn(
                    "hidden md:inline-flex",
                    !scrolled && "bg-white/20 hover:bg-white/30 text-white border-white/20"
                  )}
                >
                  <Link href={dashboardPath}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {isOrganizer ? "Dashboard" : "My Events"}
                  </Link>
                </Button>

                {/* User dropdown - Desktop */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "hidden md:flex items-center gap-2",
                        !scrolled && "text-white hover:bg-white/20"
                      )}
                    >
                      <UserAvatar
                        firstName={user.first_name}
                        lastName={user.last_name}
                        imageUrl={user.imageUrl}
                        className={cn(
                          "h-8 w-8",
                          scrolled
                            ? "ring-2 ring-border"
                            : "ring-2 ring-white shadow-lg"
                        )}
                      />
                      <span
                        className={cn(
                          "max-w-[100px] truncate",
                          !scrolled && "drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                        )}
                      >
                        {user.first_name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href={dashboardPath}>
                      <DropdownMenuItem>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        {isOrganizer ? "Dashboard" : "My Events"}
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings/profile">
                      <DropdownMenuItem>
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logoutUser()}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant={scrolled ? "ghost" : "secondary"}
                  size="sm"
                  asChild
                  className={cn(
                    "hidden md:inline-flex",
                    !scrolled && "bg-white/20 hover:bg-white/30 text-white border-white/20"
                  )}
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="hidden md:inline-flex">
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "md:hidden",
                !scrolled && "text-white hover:bg-white/20"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-b shadow-lg">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t">
                {isLoggedIn ? (
                  <>
                    {/* User info */}
                    <div className="flex items-center gap-3 pb-2">
                      <UserAvatar
                        firstName={user.first_name}
                        lastName={user.last_name}
                        imageUrl={user.imageUrl}
                        className="h-10 w-10"
                      />
                      <div>
                        <p className="font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" asChild className="w-full">
                      <Link
                        href={dashboardPath}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        {isOrganizer ? "Dashboard" : "My Events"}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link
                        href="/settings/profile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        logoutUser();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/auth/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
