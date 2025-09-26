// src/components/layout/footer.tsx
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4 md:px-6 py-12">
        <div className="col-span-2 md:col-span-1 space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Infinite Dynamics Logo"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold">GlobalConnect</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            The Intelligent Unified OS for World-Class Events.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Product</h4>
          <ul className="space-y-1">
            <li>
              <Link
                href="/events"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Events
              </Link>
            </li>
            <li>
              <Link
                href="#organizers"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                For Organizers
              </Link>
            </li>
            <li>
              <Link
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Pricing
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Company</h4>
          <ul className="space-y-1">
            <li>
              <Link
                href="#about"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="#careers"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Careers
              </Link>
            </li>
            <li>
              <Link
                href="#contact"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Legal</h4>
          <ul className="space-y-1">
            <li>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Infinite Dynamics. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
