// src/app/(public)/_components/showcase-section.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const showcaseItems = [
  {
    title: "Seamless Registration & Ticketing",
    description:
      "Our intuitive platform makes event registration a breeze for attendees and organizers alike. Customize ticket types, manage capacities, and track sales with powerful, easy-to-use tools.",
    image: "/showcase-registration.png",
    alt: "Person using a tablet with a sleek event registration interface",
    highlights: [
      "Zero friction checkout",
      "Multiple ticket types",
      "Real-time capacity tracking",
    ],
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Immersive Virtual & Hybrid Experiences",
    description:
      "Extend your reach beyond physical boundaries. Our platform supports engaging virtual and hybrid events with integrated streaming, interactive Q&A, and networking features.",
    image: "/showcase-hybrid.png",
    alt: "People engaging with both virtual and physical elements of a hybrid event",
    highlights: [
      "HD live streaming",
      "Interactive Q&A sessions",
      "Virtual networking rooms",
    ],
    gradient: "from-violet-500/20 to-purple-500/20",
  },
  {
    title: "Data-Driven Insights & Analytics",
    description:
      "Unlock the full potential of your events with comprehensive analytics. Track attendee behavior, engagement metrics, and sales performance in real-time.",
    image: "/showcase-analytics.png",
    alt: "Event organizer reviewing a data analytics dashboard with glowing charts",
    highlights: [
      "Real-time dashboards",
      "Engagement metrics",
      "Export & reporting",
    ],
    gradient: "from-emerald-500/20 to-green-500/20",
  },
];

function ShowcaseItem({
  item,
  index,
}: {
  item: (typeof showcaseItems)[0];
  index: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  const isReverse = index % 2 === 1;

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ${
        isReverse ? "lg:flex-row-reverse" : ""
      }`}
    >
      {/* Image Section */}
      <motion.div
        style={{ scale }}
        className="relative w-full lg:w-1/2"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl blur-3xl opacity-50`} />
        <div className="relative min-h-[300px] h-96 lg:h-[450px] overflow-hidden rounded-2xl shadow-2xl group">
          <Image
            src={item.image}
            alt={item.alt}
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70" />

          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-6 left-6 right-6"
          >
            <div className="flex flex-wrap gap-2">
              {item.highlights.map((highlight, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-sm text-white border border-white/20"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {highlight}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Content Section */}
      <motion.div
        style={{ y }}
        className="w-full lg:w-1/2"
      >
        <motion.span
          initial={{ opacity: 0, x: isReverse ? 20 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="inline-block px-3 py-1 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full"
        >
          Feature {index + 1}
        </motion.span>

        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
        >
          {item.title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground mb-8 leading-relaxed"
        >
          {item.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Button size="lg" variant="premium" className="group" asChild>
            <Link href="/auth/register">
              Learn More
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function VisualShowcaseSection() {
  return (
    <section className="relative bg-background py-24 sm:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 text-sm font-medium bg-primary/10 text-primary rounded-full"
          >
            Platform Showcase
          </motion.span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Experience the Future of Events
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            See how GlobalConnect empowers you to create, manage, and attend
            events like never before.
          </p>
        </motion.div>

        {/* Showcase Items */}
        <div className="space-y-16 sm:space-y-24 lg:space-y-32">
          {showcaseItems.map((item, index) => (
            <ShowcaseItem key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
