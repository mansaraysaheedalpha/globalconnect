import React from "react";

// A simple layout for public-facing pages without the admin dashboard UI.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* You could add a simple public header or footer here later */}
      <main>{children}</main>
    </div>
  );
}
