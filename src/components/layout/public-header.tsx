// src/components/layout/public-header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import { Menu, X, LayoutDashboard, LogOut, User, ChevronRight } from "lucide-react";

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, orgId, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

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
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const logoSrc = "/logo.png";
  const isLoggedIn = !!user;
  const isOrganizer = !!orgId;
  const dashboardPath = isOrganizer ? "/dashboard" : "/attendee";

  const navLinks = [
    { href: "/events", label: "Discover Events" },
    { href: "/solutions", label: "Solutions" },
    { href: "/pricing", label: "Pricing" },
    { href: "/company", label: "The Company" },
  ];

  return (
    <>
      {/* Top gradient overlay for better header visibility */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 h-40 pointer-events-none z-40 transition-opacity duration-500",
          "bg-gradient-to-b from-black/70 via-black/40 to-transparent",
          scrolled && "opacity-0"
        )}
      />

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto flex h-18 sm:h-20 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={cn(
              "relative transition-transform duration-300 group-hover:scale-105",
              !scrolled && "drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
            )}>
              <Image
                src={logoSrc}
                alt="Event Dynamics Logo"
                width={72}
                height={72}
                className="transition-all"
              />
            </div>
            <span
              className={cn(
                "text-xl font-bold transition-all duration-300",
                scrolled
                  ? "text-foreground"
                  : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
              )}
            >
              Event Dynamics
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
                  scrolled
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                    : "text-white/80 hover:text-white hover:bg-white/10",
                  pathname === link.href && (scrolled ? "text-foreground bg-muted" : "text-white bg-white/10")
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <>
                {/* Dashboard button - Desktop */}
                <Button
                  size="sm"
                  asChild
                  className={cn(
                    "hidden md:inline-flex transition-all duration-300",
                    scrolled
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-white/15 hover:bg-white/25 text-white border border-white/20"
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
                        "hidden md:flex items-center gap-2 h-10 px-2 rounded-full transition-all duration-300",
                        scrolled
                          ? "hover:bg-muted"
                          : "text-white hover:bg-white/15"
                      )}
                    >
                      <UserAvatar
                        firstName={user.first_name}
                        lastName={user.last_name}
                        imageUrl={user.imageUrl}
                        className={cn(
                          "h-8 w-8 transition-all duration-300",
                          scrolled
                            ? "ring-2 ring-border"
                            : "ring-2 ring-white/50 shadow-lg"
                        )}
                      />
                      <span
                        className={cn(
                          "max-w-[100px] truncate text-sm font-medium",
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
                        <span className="font-semibold">
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href={dashboardPath}>
                      <DropdownMenuItem className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        {isOrganizer ? "Dashboard" : "My Events"}
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Profile Settings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logoutUser()}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "hidden md:inline-flex transition-all duration-300",
                    scrolled
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className={cn(
                    "hidden md:inline-flex group transition-all duration-300",
                    !scrolled && "shadow-lg shadow-primary/30"
                  )}
                >
                  <Link href="/auth/register">
                    Get Started
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "md:hidden h-10 w-10 rounded-lg transition-all duration-300",
                scrolled
                  ? "hover:bg-muted"
                  : "text-white hover:bg-white/15"
              )}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile menu sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="right" className="w-[300px] sm:w-[350px] pr-0">
            <SheetHeader className="px-6 text-left">
              <SheetTitle className="flex items-center gap-2">
                <Image
                  src={logoSrc}
                  alt="Event Dynamics"
                  width={32}
                  height={32}
                />
                Event Dynamics
              </SheetTitle>
            </SheetHeader>

            <SheetBody className="px-6">
              <div className="flex flex-col gap-1 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      "text-muted-foreground hover:text-foreground hover:bg-muted",
                      pathname === link.href && "text-foreground bg-muted"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                ))}
              </div>

              <div className="pt-4 mt-4 border-t border-border/50 space-y-3">
                {isLoggedIn ? (
                  <>
                    {/* User info */}
                    <div className="flex items-center gap-3 px-2 py-2 mb-2">
                      <UserAvatar
                        firstName={user.first_name}
                        lastName={user.last_name}
                        imageUrl={user.imageUrl}
                        className="h-10 w-10 ring-2 ring-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" asChild className="w-full justify-start h-11">
                      <Link
                        href={dashboardPath}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-3" />
                        {isOrganizer ? "Dashboard" : "My Events"}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start h-11">
                      <Link
                        href="/settings/profile"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile Settings
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        logoutUser();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button variant="outline" asChild className="w-full h-11">
                      <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="w-full h-11">
                      <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                        Get Started
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetBody>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}