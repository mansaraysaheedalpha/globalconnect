// src/app/(public)/events/[eventId]/_components/event-hero.tsx
import Image from "next/image";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventHeroProps {
  name: string;
  imageUrl?: string | null;
  startDate: string;
  endDate: string;
  venueName?: string | null;
}

export const EventHero = ({
  name,
  imageUrl,
  startDate,
  endDate,
  venueName,
}: EventHeroProps) => {
  const imageSrc = imageUrl || `/placeholder-image.jpg`;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const formattedDate = start.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = `${start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} - ${end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;

  const isMultiDay = start.toDateString() !== end.toDateString();

  return (
    <header className="relative w-full min-h-[45vh] sm:min-h-[50vh] md:min-h-[70vh] flex items-end">
      {/* Background Image */}
      <Image
        src={imageSrc}
        alt={name}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

      {/* Content */}
      <div className="relative w-full">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 pb-8 sm:pb-12 md:pb-16">
          {/* Event Badge */}
          <Badge className="mb-3 sm:mb-4 bg-primary/90 hover:bg-primary text-primary-foreground text-xs sm:text-sm">
            Upcoming Event
          </Badge>

          {/* Event Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-4xl leading-tight">
            {name}
          </h1>

          {/* Event Meta - Stacks on mobile */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-full bg-white/10 backdrop-blur-sm">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/70">Date</p>
                <p className="font-medium text-sm sm:text-base">
                  {formattedDate}
                  {isMultiDay && (
                    <span className="text-white/70">
                      {" "}
                      -{" "}
                      {end.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 rounded-full bg-white/10 backdrop-blur-sm">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/70">Time</p>
                <p className="font-medium text-sm sm:text-base">{formattedTime}</p>
              </div>
            </div>

            {venueName && (
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 rounded-full bg-white/10 backdrop-blur-sm">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-white/70">Location</p>
                  <p className="font-medium text-sm sm:text-base">{venueName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};