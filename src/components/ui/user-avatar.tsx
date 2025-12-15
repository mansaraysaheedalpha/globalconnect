"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  className?: string;
}

export function UserAvatar({ firstName, lastName, imageUrl, className }: UserAvatarProps) {
  const initials = `${firstName?.[0] ?? ""}${
    lastName?.[0] ?? ""
  }`.toUpperCase();

  return (
    <Avatar className={cn(className)}>
      {imageUrl && (
        <AvatarImage src={imageUrl} alt={`${firstName} ${lastName}`} />
      )}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
