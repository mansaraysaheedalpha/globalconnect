// src/app/(public)/events/[eventId]/_components/event-hero.tsx
import Image from "next/image";

interface EventHeroProps {
  name: string;
  imageUrl?: string | null;
}

export const EventHero = ({ name, imageUrl }: EventHeroProps) => {
  const imageSrc = imageUrl || `/placeholder-image.jpg`;

  return (
    <header className="relative w-full h-80 md:h-96">
      <Image src={imageSrc} alt={name} fill className="object-cover" priority />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative h-full flex flex-col justify-end text-white p-6 md:p-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          {name}
        </h1>
      </div>
    </header>
  );
};
