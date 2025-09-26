// src/app/auth/layout.tsx
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* --- FORM SIDE (LEFT) --- */}
      {/* This container now handles its own scrolling if content overflows on small screens */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {/* --- VISUAL SIDE (RIGHT) --- */}
      <div className="relative hidden lg:flex lg:w-1/2">
        <Image
          src="/auth-background.png"
          alt="Abstract background image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* --- CHANGE: Logo is now here, elegantly placed --- */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full p-12 text-white">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="GlobalConnect Logo"
              width={40}
              height={40}
            />
            <span className="text-2xl font-bold">GlobalConnect</span>
          </Link>

          <div>
            <h2 className="text-3xl font-bold">
              The Intelligent OS for World-Class Events
            </h2>
            <p className="mt-4 max-w-lg text-neutral-300">
              Join thousands of creators who use GlobalConnect to deliver
              unforgettable experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
