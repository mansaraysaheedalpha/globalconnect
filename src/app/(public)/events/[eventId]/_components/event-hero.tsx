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
    <header className="relative w-full min-h-[50vh] md:min-h-[70vh] flex items-end">
      {/* Background Image */}
      <Image
        src={imageSrc}
        alt={name}
        fill
        className="object-cover"
        priority
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

      {/* Content */}
      <div className="relative w-full">
        <div className="container mx-auto max-w-6xl px-4 md:px-6 pb-12 md:pb-16">
          {/* Event Badge */}
          <Badge className="mb-4 bg-primary/90 hover:bg-primary text-primary-foreground">
            Upcoming Event
          </Badge>

          {/* Event Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-4xl leading-tight">
            {name}
          </h1>

          {/* Event Meta */}
          <div className="mt-6 flex flex-wrap gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-white/70">Date</p>
                <p className="font-medium">
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
              <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-white/70">Time</p>
                <p className="font-medium">{formattedTime}</p>
              </div>
            </div>

            {venueName && (
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-white/70">Location</p>
                  <p className="font-medium">{venueName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};