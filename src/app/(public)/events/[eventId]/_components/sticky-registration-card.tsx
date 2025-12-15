// src/app/(public)/events/[eventId]/_components/sticky-registration-card.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Ticket,
  Users,
  Clock,
  Sparkles,
} from "lucide-react";

interface StickyRegistrationCardProps {
  startDate: string;
  endDate: string;
  venueName?: string | null;
  onRegisterClick: () => void;
}

export const StickyRegistrationCard = ({
  startDate,
  endDate,
  onRegisterClick,
}: StickyRegistrationCardProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isEventStarted, setIsEventStarted] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const eventStart = new Date(startDate).getTime();
      const difference = eventStart - now;

      if (difference <= 0) {
        setIsEventStarted(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [startDate]);

  const start = new Date(startDate);
  const end = new Date(endDate);

  const formattedDate = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = `${start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} - ${end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;

  return (
    <aside className="sticky top-24">
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card via-card to-muted/30">
        {/* Header accent */}
        <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

        <CardContent className="p-6">
          {/* Countdown Timer */}
          {!isEventStarted && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Event starts in
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: timeLeft.days, label: "Days" },
                  { value: timeLeft.hours, label: "Hours" },
                  { value: timeLeft.minutes, label: "Min" },
                  { value: timeLeft.seconds, label: "Sec" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="text-center p-2 rounded-lg bg-muted/50"
                  >
                    <p className="text-2xl font-bold text-foreground">
                      {String(item.value).padStart(2, "0")}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isEventStarted && (
            <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium text-primary flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Event is happening now!
              </p>
            </div>
          )}

          {/* Register Button */}
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            onClick={onRegisterClick}
          >
            <Ticket className="h-5 w-5 mr-2" />
            Register Now
          </Button>

          {/* Free badge */}
          <p className="text-center text-sm text-muted-foreground mt-3">
            Free Registration
          </p>

          <Separator className="my-6" />

          {/* Quick Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{formattedTime}</span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Join other attendees</span>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t lg:hidden z-50">
        <Button
          size="lg"
          className="w-full h-12 font-semibold"
          onClick={onRegisterClick}
        >
          <Ticket className="h-5 w-5 mr-2" />
          Register Now - Free
        </Button>
      </div>
    </aside>
  );
};
