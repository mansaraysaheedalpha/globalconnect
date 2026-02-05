'use client';

import { Video } from 'lucide-react';

interface JoinLoadingProps {
  sessionTitle?: string;
}

export function JoinLoading({ sessionTitle }: JoinLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto" />
          <Video className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Joining Session...</h2>
          {sessionTitle && (
            <p className="text-muted-foreground mt-1">{sessionTitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
