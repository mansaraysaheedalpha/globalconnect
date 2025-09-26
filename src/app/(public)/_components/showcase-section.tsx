// src/app/(public)/_components/showcase-section.tsx
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const showcaseItems = [
  {
    title: "Seamless Registration & Ticketing",
    description:
      "Our intuitive platform makes event registration a breeze for attendees and organizers alike. Customize ticket types, manage capacities, and track sales with powerful, easy-to-use tools. Experience zero friction, maximum conversion.",
    image: "/showcase-registration.png", // Updated path
    alt: "Person using a tablet with a sleek event registration interface", // Updated Alt Text
    reverse: false,
  },
  {
    title: "Immersive Virtual & Hybrid Experiences",
    description:
      "Extend your reach beyond physical boundaries. Our platform supports engaging virtual and hybrid events with integrated streaming, interactive Q&A, and networking features, ensuring a premium experience for every attendee, everywhere.",
    image: "/showcase-hybrid.png", // Updated path
    alt: "People engaging with both virtual and physical elements of a hybrid event", // Updated Alt Text
    reverse: true,
  },
  {
    title: "Data-Driven Insights & Analytics",
    description:
      "Unlock the full potential of your events with comprehensive analytics. Track attendee behavior, engagement metrics, and sales performance in real-time. Make informed decisions and optimize your strategy for future success.",
    image: "/showcase-analytics.png", // Updated path
    alt: "Event organizer reviewing a data analytics dashboard with glowing charts", // Updated Alt Text
    reverse: false,
  },
];

export function VisualShowcaseSection() {
  return (
    <section className="bg-background py-20 sm:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Experience the Future of Events
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            See how GlobalConnect empowers you to create, manage, and attend
            events like never before.
          </p>
        </div>

        <div className="space-y-24">
          {showcaseItems.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                item.reverse ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="relative w-full lg:w-1/2 min-h-[300px] h-96 lg:h-[450px] overflow-hidden rounded-xl shadow-lg group">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {item.description}
                </p>
                <Button size="lg" asChild>
                  <Link href="/auth/register">Learn More</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
