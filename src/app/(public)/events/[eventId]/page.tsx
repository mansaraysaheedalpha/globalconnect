"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { GET_PUBLIC_EVENT_DETAILS_QUERY } from "@/graphql/public.graphql";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Mic, Ticket } from "lucide-react";
import { RegistrationModal } from "./_components/registration-model";

const PublicEventPage = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, loading, error } = useQuery(GET_PUBLIC_EVENT_DETAILS_QUERY, {
    variables: { eventId },
    skip: !eventId,
  });

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }
  if (error || !data?.event) {
    return (
      <div className="text-center py-20">Event not found or is not public.</div>
    );
  }

  const { event, publicSessionsByEvent: sessions } = data;
  const formattedDate = format(new Date(event.startDate), "MMMM d, yyyy");

  return (
    <>
      <RegistrationModal
        eventId={event.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="max-w-4xl mx-auto">
        <header className="relative">
          <img
            src={
              event.imageUrl ||
              `https://placehold.co/1200x600/6366f1/white?text=${event.name}`
            }
            alt={event.name}
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {event.name}
            </h1>
            <div className="flex items-center mt-2 text-lg">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </header>

        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold border-b pb-2 mb-4">
                About This Event
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {event.description}
              </p>

              <h2 className="text-2xl font-bold border-b pb-2 mt-12 mb-4">
                Agenda
              </h2>
              <div className="space-y-6">
                {sessions.length > 0 ? (
                  sessions.map((session: any) => (
                    <div key={session.id}>
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {format(new Date(session.startTime), "p")} -{" "}
                          {format(new Date(session.endTime), "p")}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mt-1">
                        {session.title}
                      </h3>
                      {session.speakers.length > 0 && (
                        <div className="flex items-center text-gray-600 mt-1">
                          <Mic className="h-4 w-4 mr-2" />
                          <span>
                            {session.speakers
                              .map((s: any) => s.name)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    The agenda has not been published yet.
                  </p>
                )}
              </div>
            </div>

            <aside>
              <div className="sticky top-8 p-6 bg-white border rounded-lg shadow-sm">
                <h3 className="text-xl font-bold">Register for this Event</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Sign up now to secure your spot!
                </p>
                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Ticket className="h-5 w-5 mr-2" />
                  Register Now
                </Button>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
};

export default PublicEventPage;
