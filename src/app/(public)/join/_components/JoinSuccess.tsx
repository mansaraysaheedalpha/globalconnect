'use client';

import { Check } from 'lucide-react';

interface JoinSuccessProps {
  userName: string;
  sessionTitle: string;
}

export function JoinSuccess({ userName, sessionTitle }: JoinSuccessProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Welcome, {userName}!</h2>
          <p className="text-muted-foreground mt-1">Redirecting to {sessionTitle}...</p>
        </div>
      </div>
    </div>
  );
}
