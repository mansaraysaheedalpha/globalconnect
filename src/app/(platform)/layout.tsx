// src/app/(platform)/layout.tsx
"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreateOrgModal } from "@/components/layout/CreateOrgModal";
import { SocketProvider } from "@/context/socket-context";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <SocketProvider>
      <AuthGuard>
        <CreateOrgModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
        <div className="flex h-screen w-full">
          <Sidebar onOpenCreateOrgModal={() => setIsModalOpen(true)} />
          {/* --- CHANGE 1: Add `overflow-hidden` to this container --- */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            {/* --- CHANGE 2: Add `overflow-y-auto` to the main element --- */}
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </AuthGuard>
    </SocketProvider>
  );
}
