// src/components/layout/Sidebar.tsx
import Link from 'next/link';
import Image from 'next/image';

export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-secondary/30 border-r border-border p-6 flex flex-col">
      {/* --- UPDATED BRANDING ELEMENT --- */}
      <div className="mb-10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image src="/logo.png" alt="GlobalConnect Logo" width={40} height={40} />
          <span className="text-xl font-bold">GlobalConnect</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-primary transition-all hover:text-primary/80">
          Dashboard
        </Link>
        <Link href="/events" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
          Events
        </Link>
      </nav>
    </aside>
  );
}