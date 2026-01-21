// src/app/(platform)/settings/networking/page.tsx
"use client";

import { NetworkingProfileForm } from "@/components/features/networking/networking-profile-form";
import { SettingsNav } from "../_components/settings_nav";

export default function NetworkingSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and networking profile.
        </p>
      </div>

      <SettingsNav />

      <NetworkingProfileForm />
    </div>
  );
}
