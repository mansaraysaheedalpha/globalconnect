// src/app/(platform)/layout.tsx
"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreateOrgModal } from "@/components/layout/CreateOrgModal";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <CreateOrgModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      <div className="flex h-screen w-full">
        <Sidebar
          onOpenCreateOrgModal={() => setIsModalOpen(true)}
          className="hidden lg:flex"
        />

        {/* Mobile sidebar */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0">
            <Sidebar
              onOpenCreateOrgModal={() => {
                setIsModalOpen(true);
                setIsSidebarOpen(false);
              }}
              onNavigate={() => setIsSidebarOpen(false)}
              className="w-full max-w-sm"
            />
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-y-auto outline-none"
            role="main"
            aria-label="Main content"
          >
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
